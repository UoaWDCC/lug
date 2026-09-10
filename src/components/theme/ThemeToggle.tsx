"use client";

import { applyTheme } from "./applyTheme";

export default function ThemeToggle() {
  /* min-w keeps one size in both themes; DARK and LIGHT differ in length. */
  return (
    <button
      type="button"
      onClick={() => applyTheme("toggle")}
      aria-label="Toggle colour theme"
      className="min-w-[128px] cursor-pointer rounded-full border border-[var(--input-border)] bg-[var(--chip-bg)] px-5 py-2.5 font-mono text-[17px] text-[var(--fg)] transition-transform duration-150 hover:border-[var(--accent)] hover:bg-[var(--chip-hover-bg)] active:scale-95"
    >
      <span className="theme-label-dark">
        <span className="inline-block w-[1ch] text-center">☾</span> DARK
      </span>
      <span className="theme-label-light">
        <span className="inline-block w-[1ch] text-center">☀</span> LIGHT
      </span>
    </button>
  );
}
