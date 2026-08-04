"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";
import TextField from "../_components/TextField";
import OptionButton from "../_components/OptionButton";

export function NewMemberPage({
  fields,
}: {
  fields: Partial<RegistrationDraft>;
}) {
  const state = useFormError();
  const errorFields = state?.fields;
  const field = errorFields ?? fields;

  return (
    <>
      <h2 className="m-0 text-center text-[23px] font-black">About you</h2>

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

      <fieldset className="m-0 border-none p-0">
        <legend className="mb-2.5 text-sm font-bold">
          Do you attend The University of Auckland (UoA)?
          <span
            aria-hidden
            className="ml-[3px] font-extrabold text-[var(--danger)]"
          >
            *
          </span>
        </legend>

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

        <p className="mt-2 text-xs text-[var(--muted)]">
          Students get access to member events, resources, and perks.
        </p>
      </fieldset>
    </>
  );
}
