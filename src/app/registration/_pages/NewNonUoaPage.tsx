"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";
import TextField from "../_components/TextField";

export function NewNonUoaPage({
  fields,
}: {
  fields: Partial<RegistrationDraft>;
}) {
  const state = useFormError();
  const errorFields = state?.fields;
  const field = errorFields ?? fields;

  return (
    <>
      <h2 className="m-0 text-[26px] font-black">Name & University Status</h2>

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
        name="email"
        label="Email"
        type="email"
        placeholder="name@example.com"
        defaultValue={field?.email || ""} // This is what prevents the clearing
        maxLength={254}
        error={state?.error?.includes("email") ? state.error : undefined}
      />

      <h2 className="m-0 text-[26px] font-black">Your affiliation</h2>

      <TextField
        name="primaryAffiliation"
        label="What institution or organisation are you affiliated with the most?"
        description="This can be the name of your university, your company, your research lab, etc."
        required
        placeholder="Your answer"
        defaultValue={field?.primaryAffiliation ?? ""}
        maxLength={150}
      />

      <TextField
        name="nonUoaExcerpt"
        label="Tell us more about yourself"
        description="A nice excerpt about yourself can allow us to identify you in future club events."
        multiline
        placeholder="Your answer"
        defaultValue={field?.nonUoaExcerpt ?? ""}
        maxLength={500}
      />

      <TextField
        name="nonUoaPitch"
        label="Why do you want to join our club?"
        description="Here is your chance to pitch yourself to us!"
        multiline
        placeholder="Your answer"
        defaultValue={field?.nonUoaPitch ?? ""}
        maxLength={500}
      />
    </>
  );
}
