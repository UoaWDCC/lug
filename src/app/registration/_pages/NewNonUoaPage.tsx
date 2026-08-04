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
      <h2 className="m-0 text-center text-[32px] font-black">Why LUG?</h2>

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
        rows={2}
        placeholder="Tell us a bit about who you are..."
        defaultValue={field?.nonUoaExcerpt ?? ""}
        maxLength={500}
      />

      <TextField
        name="nonUoaPitch"
        label="Why do you want to join our club?"
        description="Here is your chance to pitch yourself to us!"
        multiline
        rows={2}
        placeholder="Tell us a bit about what drew you to the club..."
        defaultValue={field?.nonUoaPitch ?? ""}
        maxLength={500}
      />
    </>
  );
}
