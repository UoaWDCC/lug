"use client";

import { applyTheme } from "./applyTheme";

/* Without JS the click submits to /theme, which sets a cookie and reloads the page. */
export default function ThemeToggle() {
  return (
    <form action="/theme" method="post" className="relative">
      {/* min-w keeps one size in both themes; DARK and LIGHT differ in length. */}
      <button
        type="submit"
        onClick={(event) => {
          event.preventDefault();
          applyTheme("toggle");
        }}
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

      {/* Absolute so it doesn't push the navbar around. */}
      <span className="absolute top-full right-0 mt-1.5 hidden font-mono text-[12px] whitespace-nowrap text-[var(--muted)] nojs:block">
        page reloads to apply
      </span>
    </form>
  );
}
