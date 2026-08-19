"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";
import TextField from "../_components/TextField";
import OptionButton from "../_components/OptionButton";

export function StartPage({ fields }: { fields: Partial<RegistrationDraft> }) {
  const state = useFormError();
  const errorFields = state?.fields;
  const field = errorFields ?? fields;

  return (
    <>
      <fieldset className="uoa-student-container m-0 border-none p-0">
        <legend className="mb-2.5 text-lg font-bold">
          Are you a UoA Student?
          <span
            aria-hidden
            className="ml-[3px] font-extrabold text-[var(--danger)]"
          >
            *
          </span>
        </legend>

        {state?.error?.includes("registered") && (
          <p className="mb-2 text-[15px] text-[var(--danger)] italic">
            {state.error}
          </p>
        )}

        <div className="flex gap-4">
          <OptionButton
            type="radio"
            name="isCurrentUoaStudent"
            value="yes"
            label="Yes"
            className="flex-1"
            defaultChecked={field?.isCurrentUoaStudent === "yes"}
            required
          />
          <OptionButton
            type="radio"
            name="isCurrentUoaStudent"
            value="no"
            label="No"
            className="flex-1"
            defaultChecked={field?.isCurrentUoaStudent === "no"}
            required
          />
        </div>
      </fieldset>

      <div className="uoa-fields flex-col gap-2.5">
        <TextField
          name="upi"
          label="What is your username/UPI?"
          defaultValue={field?.upi ?? ""}
          pattern="[a-z]{3,4}[0-9]{3}"
          hint="i.e. jbon007"
        />

        <TextField
          name="studentId"
          label="And your student ID?"
          defaultValue={field?.studentId ?? ""}
          pattern="[0-9]{9,10}"
          hint="i.e. 825179213"
        />
      </div>

      {/* Pure CSS so the conditional reveal works without JS. */}
      <style>{`
        .uoa-fields { display: none; }
        .uoa-student-container:has(input[value="yes"]:checked) ~ .uoa-fields {
          display: flex;
        }
      `}</style>
    </>
  );
}
