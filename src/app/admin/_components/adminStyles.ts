/* Shared admin class strings, so forms across the admin pages look the same. */

export const adminLabelClass =
  "mb-2 block text-base font-bold text-[var(--fg)]";

export const adminInputClass =
  "block w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-base text-[var(--fg)] transition-colors duration-150 placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30";

export const adminSelectClass =
  "cursor-pointer appearance-none rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] py-2 pr-11 pl-5 font-mono text-base text-[var(--accent-text)] transition-colors duration-150 hover:border-[var(--accent)] focus:border-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30";

/* Tables: wrapper scrolls sideways on narrow screens instead of squashing columns. */
export const adminTableWrapClass =
  "overflow-x-auto rounded-2xl border border-[var(--input-border)] bg-[var(--card-bg)]";
export const adminThClass =
  "px-5 py-4 text-left font-mono text-xs font-medium tracking-[0.12em] whitespace-nowrap text-[var(--muted)] uppercase";
export const adminTdClass = "px-5 py-4 align-middle";
/* Hover tint is a faint accent wash, so row text keeps its colour in both themes.
   It lives in --row-tint so pinned cells (below) can paint the same tint. */
export const adminRowClass =
  "border-t border-[var(--divider)] bg-[var(--row-tint)] [--row-tint:transparent] hover:[--row-tint:color-mix(in_oklab,var(--accent)_10%,transparent)]";

/* Pinned columns stay put while the table scrolls sideways (md+; on phones they would fill the screen).
   They must be opaque, so they stack row tint + card + page colours to match the see-through card. */
const pinnedBase =
  "z-[1] md:sticky [background:linear-gradient(var(--row-tint,transparent),var(--row-tint,transparent)),linear-gradient(var(--card-bg),var(--card-bg)),var(--bg)]";
export const adminPinnedClass = {
  left: `${pinnedBase} left-0 md:shadow-[inset_-1px_0_0_var(--divider)]`,
  right: `${pinnedBase} right-0 md:shadow-[inset_1px_0_0_var(--divider)]`,
};

/* Small pill badges; text colour matches the border so they read on any row background. */
const badgeBase =
  "inline-block rounded-full border px-3 py-0.5 text-sm font-bold whitespace-nowrap";
export const adminBadgeClass = {
  positive: `${badgeBase} border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent-text)]`,
  negative: `${badgeBase} border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]`,
};

/* Compact row actions. hover:text-* restates the colour so the global a:hover rule can't change it. */
const rowActionBase =
  "inline-block cursor-pointer rounded-md border bg-transparent px-4 py-1.5 font-mono text-sm font-semibold whitespace-nowrap no-underline transition-colors duration-150";
export const adminEditActionClass = `${rowActionBase} border-[var(--input-border)] text-[var(--accent-text)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent-text)]`;
export const adminDeleteActionClass = `${rowActionBase} border-[var(--danger)]/40 text-[var(--danger)] hover:border-[var(--danger)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]`;

/** Inline error banner; pair with role="alert". */
export const adminErrorClass =
  "rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]";
