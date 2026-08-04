"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";
import TextField, {
  isValidStudentId,
  isValidUpi,
} from "../_components/TextField";

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
      <h2 className="m-0 text-center text-[32px] font-black">
        Your student login
      </h2>

      <p className="m-0 text-center text-lg leading-[1.5] text-[var(--muted)]">
        A few details here, then we&apos;ll wrap things up.
      </p>

      <TextField
        name="firstName"
        label="What is your first name?"
        required
        placeholder="Your answer"
        defaultValue={field?.firstName ?? ""}
        maxLength={100}
      />

      <TextField
        name="lastName"
        label="And your last name?"
        description="If you do not have a last name, type N/A."
        required
        placeholder="Your answer"
        defaultValue={field?.lastName ?? ""}
        maxLength={100}
      />

      <TextField
        name="upi"
        label="What is your username/UPI?"
        required
        placeholder=""
        defaultValue={field?.upi ?? ""}
        pattern="[a-zA-Z]{3,4}[0-9]{3}"
        hint="Format: 3–4 letters + 3 digits, e.g. jbon007"
        validate={isValidUpi}
        okHint="✓ looks right"
        errorHint="Should look like jbon007"
      />

      <TextField
        name="studentId"
        label="And your student ID?"
        required
        placeholder=""
        defaultValue={field?.studentId ?? ""}
        pattern="[0-9]{9,10}"
        hint="Your 9–10 digit university ID"
        validate={isValidStudentId}
        okHint="✓ looks right"
        errorHint="Enter your 9–10 digit ID"
      />

      <div className="rounded-lg border border-[var(--row-border)] bg-[var(--row-bg)] px-4 py-3.5 text-[16px] leading-[1.5] text-[var(--muted)]">
        We&apos;ll use these to match you against last year&apos;s membership so
        you don&apos;t have to re-enter your study details.
      </div>
    </>
  );
}
