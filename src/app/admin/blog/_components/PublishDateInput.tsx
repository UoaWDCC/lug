"use client";

import { useEffect, useRef } from "react";
import {
  adminHintClass,
  adminInputClass,
  adminLabelClass,
} from "@/app/admin/_lib/adminStyles";

type Props = {
  /** Existing publish date as an ISO string, if any. */
  initialValue?: string;
};

/* <input type="datetime-local"> has no timezone, so the server can't tell what time was meant.
   The visible input works in the browser's local time; a hidden field carries the same moment
   as an ISO string (with "Z"), which the server parses unambiguously. */
function toLocalInputValue(iso: string) {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function PublishDateInput({ initialValue }: Props) {
  const visibleRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  // Filled after mount: the server doesn't know the viewer's timezone.
  useEffect(() => {
    if (visibleRef.current && initialValue) {
      visibleRef.current.value = toLocalInputValue(initialValue);
    }
  }, [initialValue]);

  return (
    <div>
      <label htmlFor="publishedAtLocal" className={adminLabelClass}>
        Publish date
      </label>
      <input
        ref={visibleRef}
        id="publishedAtLocal"
        type="datetime-local"
        aria-describedby="publishedAt-hint"
        onChange={(event) => {
          const value = event.target.value;
          if (hiddenRef.current) {
            hiddenRef.current.value = value
              ? new Date(value).toISOString()
              : "";
          }
        }}
        className={`${adminInputClass} py-2.5 font-mono text-sm`}
      />
      <input
        ref={hiddenRef}
        type="hidden"
        name="publishedAt"
        defaultValue={initialValue ?? ""}
      />
      <p id="publishedAt-hint" className={`mt-1.5 ${adminHintClass}`}>
        Optional. Leave blank to publish now.
      </p>
    </div>
  );
}
