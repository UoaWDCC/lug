/**
 * Wraps the member edit form with undo/redo support.
 *
 * The form uses uncontrolled inputs (defaultValue) so that the server-rendered
 * page is interactive without client-side hydration delay. Because React does
 * not own uncontrolled input values, undo/redo restores them imperatively
 * through the DOM via `applySnapshot`.
 *
 * Every save, undo and redo writes to the database immediately — there is no
 * client-side-only state. This keeps the form and the database always in sync
 * at the cost of a server round-trip per action.
 */

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
  type ReactNode,
} from "react";
import updateMemberAction from "@/features/admin-members/updateMemberAction";
import type { MemberUpdateData } from "@/repositories/memberRepository";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/app/admin/_lib/adminStyles";

type EditMemberFormProps = {
  memberId: number;
  initialState: MemberUpdateData;
  children: ReactNode;
};

type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** Converts a saved snapshot back into FormData so it can be replayed through
 *  the server action during undo/redo. Arrays use `append` to match what
 *  `formData.getAll()` expects on the server side. */
function toFormData(memberId: number, state: MemberUpdateData) {
  const data = new FormData();
  data.set("id", String(memberId));

  for (const [key, value] of Object.entries(state)) {
    if (Array.isArray(value)) {
      value.forEach((item) => data.append(key, String(item)));
    } else {
      data.set(key, value == null ? "" : String(value));
    }
  }

  return data;
}

export default function EditMemberForm({
  memberId,
  initialState,
  children,
}: EditMemberFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [savedState, setSavedState] = useState(initialState);
  const [undoStack, setUndoStack] = useState<MemberUpdateData[]>([]);
  const [redoStack, setRedoStack] = useState<MemberUpdateData[]>([]);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  // Imperatively sets every form input to match the given snapshot.
  // Needed because uncontrolled inputs ignore React state — the only way to
  // change what the user sees is through the DOM. Handles three input types:
  // - Text/select fields: set .value directly
  // - Majors (array of text inputs): matched by index
  // - Checkboxes (faculty, potentialInvolvement): set .checked by set membership
  const applySnapshot = useCallback((state: MemberUpdateData) => {
    const form = formRef.current;
    if (!form) return;

    const setValue = (name: string, value: string | null) => {
      const control = form.querySelector<FormControl>(`[name="${name}"]`);
      if (control) control.value = value ?? "";
    };

    setValue("firstName", state.firstName);
    setValue("lastName", state.lastName);
    setValue("email", state.email);
    setValue("discordUsername", state.discordUsername);
    setValue("programmeType", state.programmeType);
    setValue(
      "yearsRemaining",
      state.yearsRemaining === null ? null : String(state.yearsRemaining),
    );
    setValue("linuxSkillLevel", state.linuxSkillLevel);
    setValue("primaryAffiliation", state.primaryAffiliation);
    setValue("nonUoaExcerpt", state.nonUoaExcerpt);
    setValue("nonUoaPitch", state.nonUoaPitch);

    form
      .querySelectorAll<HTMLInputElement>('input[name="majors"]')
      .forEach((input, index) => {
        input.value = state.majors[index] ?? "";
      });

    const selectedFaculty = new Set(state.faculty);
    form
      .querySelectorAll<HTMLInputElement>('input[name="faculty"]')
      .forEach((input) => {
        input.checked = selectedFaculty.has(input.value);
      });

    const selectedInvolvement = new Set<string>(state.potentialInvolvement);
    form
      .querySelectorAll<HTMLInputElement>('input[name="potentialInvolvement"]')
      .forEach((input) => {
        input.checked = selectedInvolvement.has(input.value);
      });
  }, []);

  // Normal save flow. On success, the previous savedState is pushed onto the
  // undo stack and the redo stack is cleared (standard undo behaviour — a new
  // edit invalidates any forward history).
  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    formData.set("id", String(memberId));
    setPending(true);
    setMessage("");

    try {
      const result = await updateMemberAction(formData);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      setUndoStack((stack) => [...stack, savedState]);
      setRedoStack([]);
      setSavedState(result.data);
      applySnapshot(result.data);
      setMessage("Changes saved.");
    } catch {
      setMessage("The member could not be updated. Please try again.");
    } finally {
      setPending(false);
    }
  }

  // Shared undo/redo handler. Replays the top of the relevant stack through
  // the server action, then shuffles the stacks: the source stack is popped
  // and the current savedState is pushed onto the opposite stack.
  const applyHistory = useCallback(
    async (direction: "undo" | "redo") => {
      const source = direction === "undo" ? undoStack : redoStack;
      const target = source.at(-1);
      if (!target || pending) return;

      setPending(true);
      setMessage("");

      try {
        const result = await updateMemberAction(toFormData(memberId, target));
        if (!result.ok) {
          setMessage(result.message);
          return;
        }

        if (direction === "undo") {
          setUndoStack((stack) => stack.slice(0, -1));
          setRedoStack((stack) => [...stack, savedState]);
          setMessage("Changes undone.");
        } else {
          setRedoStack((stack) => stack.slice(0, -1));
          setUndoStack((stack) => [...stack, savedState]);
          setMessage("Changes redone.");
        }

        setSavedState(result.data);
        applySnapshot(result.data);
      } catch {
        setMessage("The member could not be updated. Please try again.");
      } finally {
        setPending(false);
      }
    },
    [applySnapshot, memberId, pending, redoStack, savedState, undoStack],
  );

  // Global keyboard shortcut listener for Ctrl+Z (undo) and Ctrl+Y / Ctrl+Shift+Z (redo).
  // Bails out when focus is inside a form control so the browser's native
  // text-level undo still works within individual inputs.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest('input, textarea, select, [contenteditable="true"]'))
      ) {
        return;
      }

      const modifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      const isUndo = modifier && key === "z" && !event.shiftKey;
      const isRedo =
        modifier && (key === "y" || (key === "z" && event.shiftKey));

      if (!isUndo && !isRedo) return;
      if (
        pending ||
        (isUndo ? undoStack.length === 0 : redoStack.length === 0)
      ) {
        return;
      }

      event.preventDefault();
      void applyHistory(isUndo ? "undo" : "redo");
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [applyHistory, pending, redoStack.length, undoStack.length]);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mt-8 flex flex-col gap-6"
    >
      {children}

      <div className="flex flex-wrap items-center gap-3">
        <button
          className={`${adminPrimaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
          type="submit"
          disabled={pending}
        >
          {pending ? "Saving..." : "Save changes"}
        </button>

        {/* Undo and redo are disabled while a save is in flight (pending) or
        when their respective stack is empty. */}
        <button
          className={`${adminSecondaryButtonClass} disabled:cursor-not-allowed disabled:border-[color-mix(in_srgb,var(--fg),transparent_85%)] disabled:text-[color-mix(in_srgb,var(--fg),transparent_85%)]`}
          type="button"
          onClick={() => void applyHistory("undo")}
          disabled={pending || undoStack.length === 0}
        >
          Undo
        </button>
        <button
          className={`${adminSecondaryButtonClass} disabled:cursor-not-allowed disabled:border-[color-mix(in_srgb,var(--fg),transparent_85%)] disabled:text-[color-mix(in_srgb,var(--fg),transparent_85%)]`}
          type="button"
          onClick={() => void applyHistory("redo")}
          disabled={pending || redoStack.length === 0}
        >
          Redo
        </button>
        <p
          className="text-sm text-[var(--muted)]"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      </div>
    </form>
  );
}
