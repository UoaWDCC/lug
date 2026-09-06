"use client";

import { usePathname } from "next/navigation";

import TerminalPrompt from "./TerminalPrompt";
import TerminalScreen from "./TerminalScreen";
import { useTerminal } from "./TerminalProvider";

/* Off-home, the same terminal session follows as a collapsed prompt that expands into a window. */
export default function TerminalDock() {
  const pathname = usePathname();
  const { isDockOpen, openDock, closeDock, lines } = useTerminal();

  if (pathname === "/") return null;

  return (
    <>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={closeDock}
        className={`fixed inset-0 z-30 cursor-default bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 ${
          isDockOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-5">
        <div className="relative w-full max-w-[620px]">
          <button
            type="button"
            onClick={openDock}
            aria-expanded={isDockOpen}
            aria-label="Open the command terminal"
            className={`pointer-events-auto mx-auto flex w-fit max-w-full items-center gap-3 rounded-full border border-[var(--term-border)] bg-[var(--term-bg)] px-5 py-2.5 font-mono text-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-[8px] transition-[opacity,transform,border-color,box-shadow] duration-300 hover:border-[var(--accent)] hover:shadow-[0_10px_34px_rgba(63,204,168,0.28)] ${
              isDockOpen
                ? "pointer-events-none translate-y-2 scale-[0.97] opacity-0"
                : "cursor-pointer opacity-100"
            }`}
          >
            <span className="font-semibold text-[var(--accent-text)]">
              lugatuoa:~{pathname}$
            </span>
            <span className="cursor-blink h-4 w-2 shrink-0 bg-[var(--fg)]" />
            <span className="hidden text-[13px] text-[var(--muted)] sm:inline">
              press{" "}
              <kbd className="rounded border border-[var(--input-border)] px-1.5 py-0.5">
                /
              </kbd>{" "}
              to type a command
            </span>
          </button>

          <div
            inert={!isDockOpen}
            className={`absolute inset-x-0 bottom-0 origin-bottom rounded-xl border border-[var(--term-border)] bg-[var(--term-bg)] shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-[10px] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isDockOpen
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none translate-y-3 scale-[0.97] opacity-0"
            }`}
          >
            {/* No title bar: the prompt already shows the path, and any chrome
                above it just ends up hidden behind the suggestion popup. */}
            {lines.length > 0 && (
              <TerminalScreen className="h-[152px] border-b border-[var(--input-border)] px-4 py-3" />
            )}

            <div className="relative flex items-center gap-3 px-4 py-2">
              {/* Keyed on the open state so each visit starts from a clean prompt. */}
              <TerminalPrompt
                key={String(isDockOpen)}
                cwd={pathname}
                onEscape={closeDock}
                className="min-w-0 flex-1"
              />

              <button
                type="button"
                onClick={closeDock}
                aria-label="Close the terminal"
                className="shrink-0 cursor-pointer rounded-md border border-[var(--row-border)] px-2 py-0.5 font-mono text-[13px] text-[var(--muted)] transition-colors duration-150 hover:border-[var(--accent)] hover:bg-[var(--row-hover-bg)] hover:text-[var(--fg)]"
              >
                esc
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
