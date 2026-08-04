"use client";

import { useState } from "react";
import type { ChangeEvent, Ref } from "react";

/* Text input with a live validation hint that mirrors the server-side rules in actions.ts. */

type TextFieldProps = {
  name: string;
  label: string;
  /** Explanatory copy shown above the input, as in the original form. */
  description?: string;
  required?: boolean;
  type?: "text" | "email";
  placeholder?: string;
  defaultValue?: string;
  maxLength?: number;
  pattern?: string;
  multiline?: boolean;
  rows?: number;
  /** Hint shown while the field is untouched. */
  hint?: string;
  validate?: (value: string) => boolean;
  okHint?: string;
  errorHint?: string;
  onInput?: (event: ChangeEvent<HTMLInputElement>) => void;
  inputRef?: Ref<HTMLInputElement>;
};

const controlClass =
  "w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 font-mono text-lg text-[var(--fg)] outline-none transition-colors duration-200 placeholder:text-[var(--muted)] focus:border-[var(--accent)]";

export default function TextField({
  name,
  label,
  description,
  required,
  type = "text",
  placeholder,
  defaultValue = "",
  maxLength,
  pattern,
  multiline,
  rows = 4,
  hint,
  validate,
  okHint,
  errorHint,
  onInput,
  inputRef,
}: TextFieldProps) {
  const [value, setValue] = useState(defaultValue);

  const trimmed = value.trim();
  let hintText = hint;
  let hintClass = "text-[var(--muted)]";

  if (validate && trimmed) {
    const valid = validate(trimmed);
    hintText = valid ? okHint : errorHint;
    hintClass = valid ? "text-[var(--accent-text)]" : "text-[var(--danger)]";
  }

  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-lg font-bold">
        {label}
        {required && (
          <span
            aria-hidden
            className="ml-[3px] font-extrabold text-[var(--danger)]"
          >
            *
          </span>
        )}
      </label>

      {description && (
        <p className="mb-1.5 text-[15px] leading-[1.4] text-[var(--muted)]">
          {description}
        </p>
      )}

      {multiline ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          placeholder={placeholder}
          defaultValue={defaultValue}
          maxLength={maxLength}
          required={required}
          onChange={(event) => setValue(event.target.value)}
          className={`${controlClass} resize-y`}
        />
      ) : (
        <input
          ref={inputRef}
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          maxLength={maxLength}
          pattern={pattern}
          required={required}
          onChange={(event) => {
            setValue(event.target.value);
            onInput?.(event);
          }}
          className={controlClass}
        />
      )}

      {hintText && (
        <div className={`mt-1.5 font-mono text-[15px] ${hintClass}`}>
          {hintText}
        </div>
      )}
    </div>
  );
}

/* Validators mirrored from src/app/registration/actions.ts. */
export const isValidUpi = (value: string) => /^[a-z]{3,4}\d{3}$/i.test(value);
export const isValidStudentId = (value: string) => /^\d{9,10}$/.test(value);
export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
