"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import {
  adminDangerButtonClass,
  adminErrorClass,
  adminSecondaryButtonClass,
} from "../_lib/adminStyles";

type Props = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  /** Resolve with an error message to keep the dialog open and show it; resolve with nothing on success. */
  onConfirm: () => Promise<string | void>;
  onClose: () => void;
};

/* Destructive-action confirmation built on a native modal <dialog>, which gives us focus trapping,
   Escape to close and an inert page behind it for free. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  pendingLabel,
  onConfirm,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Unique per instance, since a page can render several dialogs (e.g. one per row).
  const titleId = useId();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setError(null);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleConfirm() {
    startTransition(async () => {
      const message = await onConfirm();
      if (message) {
        setError(message);
      } else {
        onClose();
      }
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // Escape fires "cancel"; route it through onClose so React state stays in sync.
      onCancel={(event) => {
        event.preventDefault();
        if (!isPending) onClose();
      }}
      // A click whose target is the <dialog> itself landed on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget && !isPending) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[var(--input-border)] p-0 text-[var(--fg)] [background:linear-gradient(var(--card-bg),var(--card-bg)),var(--bg)] backdrop:bg-black/60 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 id={titleId} className="text-2xl font-black tracking-tight">
              {title}
            </h2>
            <div className="mt-2 text-[var(--muted)]">{children}</div>
          </div>
        </div>

        {error && (
          <p role="alert" className={`mt-5 sm:ml-15 ${adminErrorClass}`}>
            {error}
          </p>
        )}

        {/* sm:pl-15 = icon (44px) + gap (16px), so the buttons line up under the title. */}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-start sm:pl-15">
          {/* Cancel gets focus first, so an accidental Enter never confirms. */}
          <button
            type="button"
            autoFocus
            disabled={isPending}
            onClick={onClose}
            className={adminSecondaryButtonClass}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
            className={adminDangerButtonClass}
          >
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
