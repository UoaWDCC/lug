"use client";

import { useState } from "react";

/* Slider shows 3 curated stops from the 6-value backend enum — display simplification only, no schema change. */

const DISPLAY_LEVELS = [
  "BEGINNER_USER",
  "REGULAR_USER",
  "CONTRIBUTOR",
] as const;

const SHORT_LABELS: Record<(typeof DISPLAY_LEVELS)[number], string> = {
  BEGINNER_USER: "Beginner",
  REGULAR_USER: "Regular",
  CONTRIBUTOR: "Contributor",
};

const FULL_LABELS: Record<(typeof DISPLAY_LEVELS)[number], string> = {
  BEGINNER_USER: "I'm a beginner with Linux",
  REGULAR_USER: "I use Linux regularly",
  CONTRIBUTOR: "I contribute to Linux projects",
};

const DEFAULT_INDEX = DISPLAY_LEVELS.indexOf("BEGINNER_USER");

export default function SkillSlider({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  const stored = DISPLAY_LEVELS.indexOf(
    defaultValue as (typeof DISPLAY_LEVELS)[number],
  );
  const [index, setIndex] = useState(stored >= 0 ? stored : DEFAULT_INDEX);

  const level = DISPLAY_LEVELS[index];

  return (
    <div>
      <label
        htmlFor="linuxSkillLevelRange"
        className="mb-2.5 block text-lg font-bold"
      >
        How much do you currently know about Linux?
        <span
          aria-hidden
          className="ml-[3px] font-extrabold text-[var(--danger)]"
        >
          *
        </span>
      </label>

      <p className="mb-2.5 text-[15px] leading-[1.5] text-[var(--muted)]">
        Everyone is welcome, regardless of skill level or operating system
        choice!
      </p>

      <input
        id="linuxSkillLevelRange"
        type="range"
        name="linuxSkillLevel"
        min={0}
        max={DISPLAY_LEVELS.length - 1}
        step={1}
        value={index}
        onChange={(event) => setIndex(Number(event.target.value))}
        aria-valuetext={FULL_LABELS[level]}
        className="w-full cursor-pointer accent-[var(--accent)]"
      />

      <div aria-hidden className="mt-2 flex">
        {DISPLAY_LEVELS.map((value, i) => (
          <span
            key={value}
            className={`flex-1 text-center font-mono text-[13px] ${
              i === index
                ? "font-extrabold text-[var(--accent-text)]"
                : "text-[var(--muted)]"
            }`}
          >
            {SHORT_LABELS[value]}
          </span>
        ))}
      </div>

      <div className="mt-2.5 text-center text-lg font-extrabold text-[var(--accent-text)]">
        {FULL_LABELS[level]}
      </div>
    </div>
  );
}
