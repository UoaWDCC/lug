"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import updateMemberAction from "@/features/admin-members/updateMemberAction";
import type { MemberUpdateData } from "@/repositories/memberRepository";

type EditMemberFormProps = {
  memberId: number;
  initialState: MemberUpdateData;
  children: ReactNode;
};

type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      className="mt-6 grid gap-6 md:grid-cols-2"
    >
      {children}

      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <button
          className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          type="submit"
          disabled={pending}
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
        <button
          className="rounded-md border border-gray-300 px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={() => void applyHistory("undo")}
          disabled={pending || undoStack.length === 0}
        >
          Undo
        </button>
        <button
          className="rounded-md border border-gray-300 px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={() => void applyHistory("redo")}
          disabled={pending || redoStack.length === 0}
        >
          Redo
        </button>
        <p className="text-sm" role="status" aria-live="polite">
          {message}
        </p>
      </div>
    </form>
  );
}
