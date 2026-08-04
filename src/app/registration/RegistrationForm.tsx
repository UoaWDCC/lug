"use client";
import { createContext, useContext, useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import { accentButtonClass } from "@/components/primitive/buttonStyles";
import { submitRegistrationStep } from "./actions";
import { RegistrationFormState, RegistrationPage } from "./types";
import ProgressSteps from "./_components/ProgressSteps";
import type { StepProgress } from "./_components/steps";

const FormStateContext = createContext<RegistrationFormState>(null);

const backButtonClass =
  "mb-4 flex cursor-pointer items-center gap-1.5 self-start rounded-lg border border-[var(--input-border)] bg-transparent px-3.5 py-2 font-mono text-[13px] text-[var(--fg)] no-underline transition-[background,border-color,transform] duration-150 hover:border-[var(--accent)] hover:bg-[var(--row-hover-bg)] hover:text-[var(--fg)] active:scale-[0.96]";

export function RegistrationForm({
  currentPage,
  step,
  children,
}: {
  currentPage: RegistrationPage;
  step: StepProgress;
  children: React.ReactNode;
}) {
  const [state, submitAction] = useActionState(submitRegistrationStep, null);

  const isFirstPage = currentPage === "start";
  const isFinalPage = currentPage === "final";

  return (
    <FormStateContext.Provider value={state}>
      <form action={submitAction} noValidate className="flex flex-col">
        <input type="hidden" name="page" value={currentPage} />

        {/* On the first page there is nowhere back to but home. */}
        {isFirstPage ? (
          <Link href="/" className={backButtonClass}>
            &#8592; Back
          </Link>
        ) : (
          <button
            type="submit"
            name="intent"
            value="back"
            className={backButtonClass}
          >
            &#8592; Back
          </button>
        )}

        <ProgressSteps {...step} />

        {/* Generic Error Message */}
        {state?.error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-[var(--danger)] px-3.5 py-3 text-[13px] leading-[1.5] text-[var(--danger)]"
          >
            <strong>Error:</strong> {state.error}
          </div>
        )}

        <div className="flex flex-col gap-3.5">{children}</div>

        <SubmitButton isFinalPage={isFinalPage} />
      </form>
    </FormStateContext.Provider>
  );
}

function SubmitButton({ isFinalPage }: { isFinalPage: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="intent"
      value="submit"
      disabled={pending}
      className={`${accentButtonClass} mt-5 w-full`}
    >
      {pending
        ? "Processing…"
        : isFinalPage
          ? "Complete registration"
          : "Continue"}
    </button>
  );
}

export const useFormError = () => useContext(FormStateContext);
