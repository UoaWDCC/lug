"use client";

import { useEffect, useRef } from "react";

import CommandRain from "@/components/home/CommandRain";

/* One rAF throttled read of the blog scroll container; callers write straight to the DOM. */
function useBlogScroll(
  onFrame: (scroller: HTMLElement, progress: number) => void,
) {
  const callback = useRef(onFrame);

  useEffect(() => {
    callback.current = onFrame;
  });

  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>("[data-blog-scroll]");
    if (!scroller) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const max = scroller.scrollHeight - scroller.clientHeight;
      const progress =
        max > 0 ? Math.min(1, Math.max(0, scroller.scrollTop / max)) : 0;
      callback.current(scroller, progress);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
}

const RAIN = [
  "make -j8",
  "vmlinuz",
  "initramfs",
  "menuconfig",
  "modprobe",
  "pacman -Syu",
];

const BAND_MASK =
  "linear-gradient(to bottom, #000 0%, #000 46%, transparent 100%)";

/* Index hero: image drifts slower than the page and the band fades out over the first 340px. */
export function BlogHero() {
  const band = useRef<HTMLDivElement>(null);
  const images = useRef<HTMLDivElement>(null);

  useBlogScroll((scroller) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const y = scroller.scrollTop;
    if (images.current) {
      images.current.style.transform = `translateY(${(y * 0.4).toFixed(1)}px)`;
    }
    if (band.current) {
      const fade = Math.max(0, 1 - Math.pow(Math.min(1, y / 340), 1.35));
      band.current.style.opacity = fade.toFixed(3);
    }
  });

  return (
    <div
      ref={band}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[380px] overflow-hidden will-change-[opacity]"
      style={{ WebkitMaskImage: BAND_MASK, maskImage: BAND_MASK }}
    >
      <div ref={images} className="absolute inset-0 will-change-transform">
        <div className="blog-hero-img blog-hero-img--dark" />
        <div className="blog-hero-img blog-hero-img--light" />
      </div>

      {/* Right half only, so the rain never sits behind the heading. */}
      <div className="absolute inset-0 max-md:hidden">
        <CommandRain
          commands={RAIN}
          from={50}
          step={8}
          textClassName="text-[12px]"
        />
      </div>

      <div className="blog-hero-scrim" />
    </div>
  );
}

/* Post header: read percentage plus a progress bar along its bottom edge. */
export function ReadProgress() {
  const label = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useBlogScroll((_scroller, progress) => {
    if (label.current)
      label.current.textContent = `${Math.round(progress * 100)}%`;
    if (bar.current)
      bar.current.style.width = `${(progress * 100).toFixed(1)}%`;
  });

  return (
    <>
      <span
        ref={label}
        aria-hidden
        className="min-w-[38px] text-right font-mono text-[12px] font-semibold text-[var(--accent-text)] nojs:hidden"
      >
        0%
      </span>
      <div
        aria-hidden
        className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--hairline)]"
      >
        <div
          ref={bar}
          className="h-full w-0 bg-[var(--accent)] transition-[width] duration-[80ms] ease-linear"
        />
      </div>
    </>
  );
}
