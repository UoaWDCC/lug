"use client";
import { createContext, useContext, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitRegistrationStep } from "./actions";
import { RegistrationFormState, RegistrationPage } from "./types";

const FormStateContext = createContext<RegistrationFormState>(null);

export function RegistrationForm({
  currentPage,
  children,
}: {
  currentPage: RegistrationPage;
  children: React.ReactNode;
}) {
  const [state, submitAction] = useActionState(submitRegistrationStep, null);

  const isFirstPage = currentPage === "start";
  const isFinalPage = currentPage === "final";

  return (
    <FormStateContext.Provider value={state}>
      <form action={submitAction} noValidate className="flex flex-col gap-6">
        <input type="hidden" name="page" value={currentPage} />

        {/* Generic Error Message */}
        {state?.error && (
          <div role="alert" style={{ color: "red" }}>
            <strong>Error:</strong> {state.error}
          </div>
        )}

        {children}
        {!isFirstPage && (
          <button
            type="submit"
            name="intent"
            value="back"
            className="self-start px-6 py-2 bg-green-600 text-white rounded"
          >
            Prev
          </button>
        )}

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
      className="self-start px-6 py-2 bg-green-600 text-white rounded"
    >
      {pending ? "Processing..." : isFinalPage ? "Submit" : "Next"}
    </button>
  );
}

export const useFormError = () => useContext(FormStateContext);
