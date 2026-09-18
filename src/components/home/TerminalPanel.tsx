"use client";

import Link from "next/link";

import { ViewTransition } from "@/components/primitive/ViewTransition";
import TerminalPrompt from "@/components/terminal/TerminalPrompt";
import TerminalScreen from "@/components/terminal/TerminalScreen";
import { useTerminal } from "@/components/terminal/TerminalProvider";

/* Real links, so the three headline destinations still work without JavaScript. */
const NAV_ROWS = [
  { n: "01", cmd: "./sign-up", desc: "Join LUG@UoA", href: "/registration" },
  { n: "02", cmd: "./about-us", desc: "What we do", href: "/about" },
  { n: "03", cmd: "./our-events", desc: "What's on", href: "/events" },
];

export default function TerminalPanel() {
  const { lines, focusPrompt } = useTerminal();

  return (
    <ViewTransition name="signup-window">
      {/* Grows into the space the top-aligned hero leaves, capped at max-h so it stays a bordered window, not a slab. */}
      <div className="flex max-h-[430px] min-h-0 w-full max-w-[680px] flex-1 flex-col rounded-xl border border-[var(--term-border)] bg-[var(--term-bg)] font-mono shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-[8px]">
        <div className="flex items-center justify-between gap-4 rounded-t-xl border-b border-[var(--input-border)] px-5 py-3.5">
          <span className="text-[17px] text-[var(--muted)]">lugatuoa:~</span>

          {/* In the chrome rather than under the panel: the hero has no room to spare. */}
          <button
            type="button"
            onClick={focusPrompt}
            className="hidden cursor-pointer rounded-full border border-[var(--row-border)] px-3.5 py-1 text-[14px] text-[var(--muted)] transition-[background,border-color,color] duration-150 hover:border-[var(--accent)] hover:bg-[var(--row-hover-bg)] hover:text-[var(--fg)] sm:inline-block"
          >
            start with <kbd className="text-[var(--row-cmd)]">/help</kbd>
          </button>

          <span
            aria-hidden
            className="flex items-center gap-[18px] text-[var(--muted)]"
          >
            <span className="h-[1.5px] w-3.5 bg-current" />
            <span className="h-3.5 w-3.5 rounded-[2px] border-[1.5px] border-current" />
            <span className="relative h-3.5 w-3.5">
              <span className="absolute top-1/2 left-0 h-[1.5px] w-full rotate-45 bg-current" />
              <span className="absolute top-1/2 left-0 h-[1.5px] w-full -rotate-45 bg-current" />
            </span>
          </span>
        </div>

        <div className="min-h-[190px] flex-1 overflow-hidden px-5 py-4">
          {lines.length > 0 ? (
            <TerminalScreen className="h-full" />
          ) : (
            <div className="flex h-full flex-col justify-center gap-3.5">
              <div className="shrink-0 text-[18px] font-bold text-[var(--fg)]">
                Welcome to LUG@UoA, pick a command:
              </div>

              {/* flex-1 fills leftover height; max-h keeps rows looking like command lines, not slabs. */}
              {NAV_ROWS.map((row) => (
                <Link
                  key={row.cmd}
                  href={row.href}
                  className="group flex max-h-[72px] w-full flex-1 items-center justify-between gap-2 rounded-lg border border-[var(--row-border)] bg-[var(--row-bg)] px-3.5 py-2.5 text-left no-underline transition-[transform,box-shadow] duration-200 hover:translate-x-[5px] hover:border-[var(--accent)] hover:bg-[var(--row-hover-bg)] hover:shadow-[0_6px_18px_rgba(63,204,168,0.22)] active:translate-x-[5px] active:scale-[0.98] sm:px-4 sm:py-3"
                >
                  <span className="text-[15px] font-semibold whitespace-nowrap text-[var(--row-cmd)] sm:text-[17px]">
                    {row.n} {row.cmd}
                  </span>
                  <span className="flex items-center gap-2 text-[13px] whitespace-nowrap text-[var(--row-desc)] sm:gap-2.5 sm:text-[16px]">
                    <span>{row.desc}</span>
                    <span
                      aria-hidden
                      className="font-bold text-[var(--row-cmd)] transition-transform duration-200 group-hover:translate-x-1"
                    >
                      &#8594;
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-b-xl border-t border-[var(--input-border)] px-5 py-3.5">
          <TerminalPrompt />
        </div>
      </div>
    </ViewTransition>
  );
}
