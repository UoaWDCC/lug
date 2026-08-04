"use client";

import { THEME_STORAGE_KEY } from "./ThemeScript";

/* Theme lives on <html data-theme>, not React state, so server and client markup always match. */
export default function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // localStorage can be unavailable; toggle still works, just won't persist.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle colour theme"
      className="cursor-pointer rounded-full border border-[var(--input-border)] bg-[var(--chip-bg)] px-5 py-2.5 font-mono text-[17px] text-[var(--fg)] transition-[background,border-color,transform] duration-150 hover:border-[var(--accent)] hover:bg-[var(--chip-hover-bg)] active:scale-95"
    >
      <span className="theme-label-dark">☾ DARK</span>
      <span className="theme-label-light">☀ LIGHT</span>
    </button>
  );
}
