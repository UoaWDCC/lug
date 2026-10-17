"use client";

import { useEffect } from "react";

/* When the theme flips, elements with their own short colour transitions (hover effects) would
   jump to the new colours while the rest of the page fades over --theme-transition. This marks
   <html data-theme-fading> for the length of the fade; globals.css pauses admin transitions
   meanwhile, so every colour follows the single root fade together. */
export function ThemeFadeSync() {
  useEffect(() => {
    const root = document.documentElement;
    // Browsers may serialise the token as "620ms" or ".62s".
    const raw = getComputedStyle(root)
      .getPropertyValue("--theme-transition")
      .trim();
    const fadeMs =
      (raw.endsWith("ms") ? parseFloat(raw) : parseFloat(raw) * 1000) || 620;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Mutation callbacks run before the browser restyles, so the pause is in place
    // before the colour change could start any per-element transition.
    const observer = new MutationObserver(() => {
      root.dataset.themeFading = "";
      clearTimeout(timer);
      timer = setTimeout(() => delete root.dataset.themeFading, fadeMs + 50);
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
      clearTimeout(timer);
      delete root.dataset.themeFading;
    };
  }, []);

  return null;
}
