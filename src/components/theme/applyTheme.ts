import { THEME_STORAGE_KEY } from "./ThemeScript";

/* Theme lives on <html data-theme>, not React state, so server and client markup always match. */

export type Theme = "light" | "dark";

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function applyTheme(next: Theme | "toggle"): Theme {
  const resolved =
    next === "toggle" ? (currentTheme() === "light" ? "dark" : "light") : next;

  /* The cross-fade is entirely CSS; flipping the attribute is all that's needed. */
  document.documentElement.dataset.theme = resolved;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, resolved);
  } catch {
    // localStorage can be unavailable; the switch still works, just won't persist.
  }

  return resolved;
}
