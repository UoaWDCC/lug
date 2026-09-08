"use client";

import { applyTheme } from "./applyTheme";

export default function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={() => applyTheme("toggle")}
      aria-label="Toggle colour theme"
      className="cursor-pointer rounded-full border border-[var(--input-border)] bg-[var(--chip-bg)] px-5 py-2.5 font-mono text-[17px] text-[var(--fg)] transition-transform duration-150 hover:border-[var(--accent)] hover:bg-[var(--chip-hover-bg)] active:scale-95"
    >
      <span className="theme-label-dark">☾ DARK</span>
      <span className="theme-label-light">☀ LIGHT</span>
    </button>
  );
}
