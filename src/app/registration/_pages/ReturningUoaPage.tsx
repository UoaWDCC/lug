"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";

export function ReturningUoaPage({
  fields,
}: {
  fields: Partial<RegistrationDraft>;
}) {
  const state = useFormError();
  const errorFields = state?.fields;
  const field = errorFields ?? fields;

  return (
    <>
      <h2>Returning UoA Students</h2>
      <p>
        We have two questions from you in this section, and then a few more
        questions to wrap things up.
      </p>

      <div>
        <label htmlFor="upi">What is your username/UPI?*</label>
        <p>i.e. jbon007</p>
        <input
          name="upi"
          id="upi"
          type="text"
          placeholder="Your answer"
          defaultValue={field?.upi ?? ""}
          pattern="[a-z]{3,4}[0-9]{3}"
          required
        />
        {state?.error?.includes("upi") && (
          <p className="text-red-600 text-sm italic mt-1">{state.error}</p>
        )}
      </div>

      <div>
        <label htmlFor="studentId">And your student ID?*</label>
        <p>i.e. 825179213</p>
        <input
          name="studentId"
          id="studentId"
          type="text"
          placeholder="Your answer"
          defaultValue={field?.studentId ?? ""}
          pattern="[0-9]{9,10}"
          required
        />
        {state?.error?.includes("Student") && (
          <p className="text-red-600 text-sm italic mt-1">{state.error}</p>
        )}
      </div>
    </>
  );
}
