"use client";

import { useEffect, useRef } from "react";

import { useTerminal } from "./TerminalProvider";
import type { LineTone } from "./commands";

const TONE_CLASS: Record<LineTone, string> = {
  command: "text-[var(--fg)]",
  default: "text-[var(--fg)]",
  muted: "text-[var(--muted)]",
  accent: "text-[var(--accent-text)]",
  danger: "text-[var(--danger)]",
};

const SCROLLING_CLASS = "gap-1.5 overflow-y-auto leading-[1.55]";

/* Tighter so `help` still fits on short laptop screens. */
const FIXED_CLASS =
  "justify-end gap-0.5 overflow-hidden leading-[1.4] short:text-[14px] shorter:text-[13px] shorter:leading-[1.35]";

export default function TerminalScreen({
  className = "",
  scrollable = true,
}: {
  className?: string;
  /** Off: newest lines pin to the bottom and older ones slide out the top, like a real tty. */
  scrollable?: boolean;
}) {
  const { lines } = useTerminal();
  const ref = useRef<HTMLDivElement>(null);

  /* Snap rather than animate, so it still works in a backgrounded tab. */
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <div
      ref={ref}
      role="log"
      aria-live="polite"
      aria-label="Terminal output"
      className={`term-screen flex flex-col font-mono text-[16px] ${scrollable ? SCROLLING_CLASS : FIXED_CLASS} ${className}`}
    >
      {lines.map((line) => (
        <div
          key={line.id}
          className={`term-line flex items-baseline gap-4 ${TONE_CLASS[line.tone ?? "default"]}`}
        >
          <span className="min-w-0 flex-1 break-words whitespace-pre-wrap">
            {line.tone === "command" && (
              <span className="font-semibold text-[var(--accent-text)]">
                lug@uoa:~{line.cwd}${" "}
              </span>
            )}
            {line.text}
          </span>

          {line.hint && (
            <span
              className={`shrink-0 text-[var(--muted)] ${scrollable ? "" : "max-sm:hidden"}`}
            >
              {line.hint}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
