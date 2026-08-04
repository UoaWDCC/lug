"use client";

import type { Ref } from "react";

/* Hidden native radio/checkbox underneath so it submits and works without JS; styling follows :checked. */

type OptionButtonProps = {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
  required?: boolean;
  /** Layout classes for the button surface (padding, alignment, flex sizing). */
  surfaceClassName?: string;
  /** Layout classes for the wrapping label. */
  className?: string;
  inputRef?: Ref<HTMLInputElement>;
};

export default function OptionButton({
  type,
  name,
  value,
  label,
  defaultChecked,
  required,
  surfaceClassName = "justify-center px-4 py-3.5",
  className = "",
  inputRef,
}: OptionButtonProps) {
  return (
    <label className={`group block cursor-pointer ${className}`}>
      <input
        ref={inputRef}
        type={type}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        required={required}
        className="sr-only"
      />
      <span
        className={`flex items-center rounded-lg border border-[var(--input-border)] bg-transparent font-sans text-[13.5px] font-semibold text-[var(--fg)] transition-[filter,transform,background,border-color] duration-150 group-hover:brightness-[1.12] group-active:scale-[0.98] group-has-[:checked]:border-[var(--accent)] group-has-[:checked]:bg-[var(--accent)] group-has-[:checked]:text-black group-has-[:focus-visible]:ring-2 group-has-[:focus-visible]:ring-[var(--accent)] group-has-[:focus-visible]:ring-offset-2 group-has-[:focus-visible]:ring-offset-[var(--bg)] ${surfaceClassName}`}
      >
        {type === "checkbox" && (
          <span
            aria-hidden
            className="mr-2 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-[var(--input-border)] bg-transparent text-[10px] leading-none font-black text-[var(--accent)] group-has-[:checked]:border-black group-has-[:checked]:bg-black"
          >
            <span className="hidden group-has-[:checked]:inline">&#10003;</span>
          </span>
        )}
        {label}
      </span>
    </label>
  );
}
