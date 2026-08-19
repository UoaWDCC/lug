"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { applyTheme } from "@/components/theme/applyTheme";
import { resolveCommand, type TerminalLine } from "./commands";

/* `cwd` is stamped on echo lines so the transcript records where each command was typed. */
export type ScreenLine = TerminalLine & { id: number; cwd?: string };

type TerminalContextValue = {
  lines: ScreenLine[];
  history: string[];
  run: (input: string) => void;
  isDockOpen: boolean;
  openDock: () => void;
  closeDock: () => void;
  focusPrompt: () => void;
};

const TerminalContext = createContext<TerminalContextValue | null>(null);

export function useTerminal() {
  const value = useContext(TerminalContext);
  if (!value)
    throw new Error("useTerminal must be used inside TerminalProvider");
  return value;
}

/* Keeps the transcript bounded; nobody scrolls back further than this. */
const MAX_LINES = 200;

const FIELD_SELECTOR = [
  'main input:not([type="hidden"]):not([disabled])',
  "main select:not([disabled])",
  "main textarea:not([disabled])",
].join(", ");

/* Only one prompt is ever mounted, so the DOM is a more reliable handle than a racing ref. */
function focusPrompt() {
  requestAnimationFrame(() => {
    const input = document.querySelector<HTMLInputElement>(
      "[data-terminal-prompt]",
    );
    if (!input) return;

    // Bounce focus so a repeated hotkey reopens the suggestion list.
    if (document.activeElement === input) input.blur();
    input.focus();
  });
}

/* The destination page mounts after the URL changes, so poll a few frames for its first field. */
function focusArrival(deadline = 700) {
  const started = performance.now();

  const attempt = () => {
    const field =
      document.querySelector<HTMLElement>("[data-terminal-focus]") ??
      document.querySelector<HTMLElement>(FIELD_SELECTOR);

    if (field) {
      field.focus();
      return;
    }

    if (performance.now() - started < deadline) {
      requestAnimationFrame(attempt);
      return;
    }

    // No form to land in, so hand focus to the new content instead of the body.
    const main = document.querySelector("main");
    if (main) {
      main.setAttribute("tabindex", "-1");
      (main as HTMLElement).focus({ preventScroll: true });
    }
  };

  requestAnimationFrame(attempt);
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export default function TerminalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [lines, setLines] = useState<ScreenLine[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isDockOpen, setDockOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const nextId = useRef(0);
  const pendingArrival = useRef(false);

  const append = useCallback((incoming: Omit<ScreenLine, "id">[]) => {
    if (incoming.length === 0) return;

    setLines((current) => {
      const next = incoming.map((line) => ({ ...line, id: nextId.current++ }));
      return [...current, ...next].slice(-MAX_LINES);
    });
  }, []);

  const openDock = useCallback(() => {
    setDockOpen(true);
    focusPrompt();
  }, []);

  const closeDock = useCallback(() => setDockOpen(false), []);

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim();
      if (!input) return;

      setHistory((current) => [
        ...current.filter((entry) => entry !== input),
        input,
      ]);

      const result = resolveCommand(input);

      if (result.clear) {
        setLines([]);
        return;
      }

      append([
        { text: input, tone: "command", cwd: isHome ? "" : pathname },
        ...result.lines,
      ]);

      if (result.theme) {
        setAnnouncement(`Switched to ${applyTheme(result.theme)} theme`);
        return;
      }

      if (result.exit) {
        if (isDockOpen) {
          closeDock();
        } else if (!isHome) {
          pendingArrival.current = true;
          router.push("/");
        } else {
          append([{ text: "nowhere to exit to, you're home.", tone: "muted" }]);
        }
        return;
      }

      if (result.navigate) {
        if (result.navigate === pathname) {
          append([{ text: "already here.", tone: "muted" }]);
          closeDock();
          return;
        }

        pendingArrival.current = true;
        closeDock();
        setAnnouncement(`Navigating to ${result.navigate}`);
        router.push(result.navigate);
      }
    },
    [append, closeDock, isDockOpen, isHome, pathname, router],
  );

  // Runs after the new route commits, so the field it finds belongs to the new page.
  useEffect(() => {
    if (!pendingArrival.current) return;
    pendingArrival.current = false;
    focusArrival();
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isPaletteKey =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";

      if (isPaletteKey) {
        event.preventDefault();
        if (isHome) focusPrompt();
        else if (isDockOpen) closeDock();
        else openDock();
        return;
      }

      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      // Never hijack `/` from someone filling in the registration form.
      if (isTypingTarget(event.target)) return;

      event.preventDefault();
      if (isHome) focusPrompt();
      else openDock();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeDock, isDockOpen, isHome, openDock]);

  const value = useMemo(
    () => ({
      lines,
      history,
      run,
      isDockOpen,
      openDock,
      closeDock,
      focusPrompt,
    }),
    [lines, history, run, isDockOpen, openDock, closeDock],
  );

  return (
    <TerminalContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </TerminalContext.Provider>
  );
}
