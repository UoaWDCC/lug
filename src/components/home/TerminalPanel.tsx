import Link from "next/link";

/* The prototype's ./sign-up screen maps to our /registration route. */
const NAV_ROWS = [
  { n: "01", cmd: "./sign-up", desc: "Join LUG@UoA", href: "/registration" },
  { n: "02", cmd: "./about-us", desc: "What we do", href: "/about" },
  { n: "03", cmd: "./our-events", desc: "What's on", href: "/events" },
];

export default function TerminalPanel() {
  return (
    <div className="w-full max-w-[460px] overflow-hidden rounded-xl border border-[var(--term-border)] bg-[var(--term-bg)] font-mono shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-[8px]">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-[var(--input-border)] px-3.5 py-2.5">
        <span className="text-[13px] text-[var(--muted)]">lugatuoa:~</span>
        <span
          aria-hidden
          className="flex items-center gap-[11px] text-[var(--muted)]"
        >
          <span className="h-[1.5px] w-2.5 bg-current" />
          <span className="h-[9px] w-[9px] rounded-[2px] border-[1.5px] border-current" />
          <span className="relative h-2.5 w-2.5">
            <span className="absolute top-1/2 left-0 h-[1.5px] w-full rotate-45 bg-current" />
            <span className="absolute top-1/2 left-0 h-[1.5px] w-full -rotate-45 bg-current" />
          </span>
        </span>
      </div>

      {/* Command rows */}
      <div className="flex flex-col gap-[9px] px-3.5 pt-3.5 pb-2">
        <div className="text-sm font-bold text-[var(--fg)]">
          Welcome to LUG@UoA, pick a command:
        </div>

        {NAV_ROWS.map((row) => (
          <Link
            key={row.cmd}
            href={row.href}
            className="group flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--row-border)] bg-[var(--row-bg)] px-3 py-[9px] text-left no-underline transition-[background,border-color,transform,box-shadow] duration-200 hover:translate-x-[5px] hover:border-[var(--accent)] hover:bg-[var(--row-hover-bg)] hover:shadow-[0_6px_18px_rgba(63,204,168,0.22)] active:translate-x-[5px] active:scale-[0.98]"
          >
            <span className="text-[13.5px] font-semibold whitespace-nowrap text-[var(--row-cmd)]">
              {row.n} {row.cmd}
            </span>
            <span className="flex items-center gap-[9px] text-[12.5px] whitespace-nowrap text-[var(--row-desc)]">
              <span>{row.desc}</span>
              <span
                aria-hidden
                className="font-bold text-[var(--accent-text)] transition-transform duration-200 group-hover:translate-x-1"
              >
                &#8594;
              </span>
            </span>
          </Link>
        ))}
      </div>

      {/* Prompt — decorative only, not typable. */}
      <div className="flex items-center gap-2 border-t border-[var(--input-border)] px-3.5 py-[11px]">
        <span className="text-[13.5px] font-semibold whitespace-nowrap text-[var(--accent-text)]">
          lugatuoa:~$
        </span>
        <span
          aria-hidden
          className="cursor-blink h-[15px] w-2 bg-[var(--fg)]"
        />
      </div>
    </div>
  );
}
