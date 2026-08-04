/* Shared button styles as class strings so they work on <button>, <a>, and <Link>. */

/** Solid accent call-to-action (Continue, Join us, Complete registration). */
export const accentButtonClass =
  "inline-block cursor-pointer rounded-lg border-none bg-[var(--accent)] px-7 py-3.5 text-center font-sans text-xl font-bold text-black no-underline transition-[transform,filter,box-shadow] duration-150 hover:-translate-y-0.5 hover:text-black hover:brightness-[1.08] hover:shadow-[0_8px_20px_rgba(63,204,168,0.35)] active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none";

/** Outlined secondary action (back home, Edit my details). */
export const ghostButtonClass =
  "inline-block cursor-pointer rounded-lg border border-[var(--input-border)] bg-transparent px-7 py-3.5 text-center font-mono text-xl font-semibold text-[var(--fg)] no-underline transition-[background,border-color,transform] duration-150 hover:border-[var(--accent)] hover:bg-[var(--row-hover-bg)] hover:text-[var(--fg)] active:scale-[0.97]";

/** Scrollable page shell used by every screen except the home hero. */
export const scrollableMainClass =
  "relative z-10 min-h-0 flex-1 overflow-y-auto px-9 pt-2.5 pb-6";
