/* Shared admin class strings, so forms across the admin pages look the same. */

export const adminLabelClass =
  "mb-2 block text-base font-bold text-[var(--fg)]";

export const adminInputClass =
  "block w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-base text-[var(--fg)] transition-colors duration-150 placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30";

/** Inline error banner; pair with role="alert". */
export const adminErrorClass =
  "rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]";
