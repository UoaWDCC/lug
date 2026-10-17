"use client";

import { usePathname } from "next/navigation";

import TerminalPrompt from "./TerminalPrompt";
import TerminalScreen from "./TerminalScreen";
import { useTerminal } from "./TerminalProvider";

const smallButtonClass =
  "shrink-0 cursor-pointer rounded-md border border-[var(--row-border)] px-2 py-0.5 font-mono text-[13px] text-[var(--muted)] transition-colors duration-150 hover:border-[var(--accent)] hover:bg-[var(--row-hover-bg)] hover:text-[var(--fg)]";

const pillClass =
  "pointer-events-auto mx-auto flex w-fit max-w-full items-center gap-3 rounded-full border border-[var(--term-border)] bg-[var(--term-bg)] px-5 py-2.5 font-mono text-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-[8px]";

/* Off-home, the same terminal session follows as a collapsed prompt that expands into a window. */
export default function TerminalDock() {
  const pathname = usePathname();
  const {
    isDockOpen,
    openDock,
    closeDock,
    lines,
    isSidebarCollapsed,
    expandSidebar,
  } = useTerminal();

  if (pathname === "/") return null;

  const onBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  // Wide blog pages show the sidebar terminal instead, unless it's been collapsed.
  const hiddenClass = onBlog && !isSidebarCollapsed ? "min-[900px]:hidden" : "";
  const canExpand = onBlog && isSidebarCollapsed;
  const fadeWhenOpen = isDockOpen
    ? "pointer-events-none translate-y-2 scale-[0.97] opacity-0"
    : "cursor-pointer opacity-100";

  return (
    <div className={hiddenClass}>
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
          <div className="flex items-center justify-center gap-2.5 nojs:hidden">
            <button
              type="button"
              onClick={openDock}
              aria-expanded={isDockOpen}
              aria-label="Open the command terminal"
              className={`${pillClass} min-w-0 transition-[opacity,transform,border-color,box-shadow] duration-300 hover:border-[var(--accent)] hover:shadow-[0_10px_34px_rgba(63,204,168,0.28)] ${fadeWhenOpen}`}
            >
              <span className="min-w-0 truncate font-semibold text-[var(--accent-text)]">
                lug@uoa:~{pathname}$
              </span>
              <span className="cursor-blink h-4 w-2 shrink-0 bg-[var(--fg)]" />
              <span className="hidden shrink-0 text-[13px] whitespace-nowrap text-[var(--muted)] sm:inline">
                press{" "}
                <kbd className="rounded border border-[var(--input-border)] px-1.5 py-0.5">
                  /
                </kbd>{" "}
                to type a command
              </span>
            </button>

            {canExpand && (
              <button
                type="button"
                onClick={expandSidebar}
                aria-label="Dock the terminal to the sidebar"
                className={`pointer-events-auto hidden h-[42px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--term-border)] bg-[var(--term-bg)] px-4 font-mono text-[13px] text-[var(--muted)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-[8px] transition-[opacity,transform,color,border-color] duration-300 hover:border-[var(--accent)] hover:text-[var(--accent-text)] min-[900px]:flex ${fadeWhenOpen}`}
              >
                dock
              </button>
            )}
          </div>

          <div
            className={`${pillClass} hidden cursor-not-allowed opacity-60 nojs:flex`}
          >
            <span className="shrink-0 font-semibold text-[var(--accent-text)]">
              lug@uoa:~{pathname}$
            </span>
            <span className="text-[13px] text-[var(--muted)]">
              enable JavaScript to use the terminal
            </span>
          </div>

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
                showKeyHints={!canExpand}
                className="min-w-0 flex-1"
              />

              {canExpand && (
                <button
                  type="button"
                  onClick={expandSidebar}
                  aria-label="Dock the terminal to the sidebar"
                  className={`${smallButtonClass} hidden min-[900px]:block`}
                >
                  dock
                </button>
              )}

              <button
                type="button"
                onClick={closeDock}
                aria-label="Close the terminal"
                className={smallButtonClass}
              >
                esc
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
