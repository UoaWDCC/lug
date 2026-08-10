"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";

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
      <h2>Name & University Status</h2>

      <div>
        <label htmlFor="firstName">What is your first name?*</label>
        <input
          name="firstName"
          id="firstName"
          type="text"
          placeholder="Your answer"
          defaultValue={field?.firstName ?? ""}
          maxLength={100}
          required
        />
      </div>

      <div>
        <label htmlFor="lastName">And your last name?*</label>
        <p>If you do not have a last name, type N/A.</p>
        <input
          name="lastName"
          id="lastName"
          type="text"
          placeholder="Your answer"
          defaultValue={field?.lastName ?? ""}
          maxLength={100}
          required
        />
      </div>

      <div>
        <label htmlFor="email">Email*</label>
        <input
          name="email"
          id="email"
          type="email"
          placeholder="name@example.com"
          defaultValue={field?.email || ""} // This is what prevents the clearing
          className={`border p-2 w-full ${state?.error?.includes("email") ? "border-red-500" : "border-gray-300"}`}
          maxLength={254}
        />
        {state?.error?.includes("email") && (
          <p className="text-red-600 text-sm italic mt-1">{state.error}</p>
        )}
      </div>

      <h2>Your affiliation</h2>

      <div>
        <label htmlFor="primaryAffiliation">
          What institution or organisation are you affiliated with the most?*
        </label>
        <p>
          This can be the name of your university, your company, your research
          lab, etc.
        </p>
        <input
          name="primaryAffiliation"
          id="primaryAffiliation"
          type="text"
          placeholder="Your answer"
          defaultValue={field?.primaryAffiliation ?? ""}
          maxLength={150}
          required
        />
      </div>

      <div>
        <label htmlFor="nonUoaExcerpt"> Tell us more about yourself</label>
        <p>
          A nice excerpt about yourself can allow us to identify you in future
          club events.
        </p>
        <textarea
          name="nonUoaExcerpt"
          id="nonUoaExcerpt"
          placeholder="Your answer"
          defaultValue={field?.nonUoaExcerpt ?? ""}
          maxLength={500}
        />
      </div>

      <div>
        <label htmlFor="nonUoaPitch"> Why do you want to join our club?</label>
        <p>Here is your chance to pitch yourself to us!</p>
        <textarea
          name="nonUoaPitch"
          id="nonUoaPitch"
          placeholder="Your answer"
          defaultValue={field?.nonUoaPitch ?? ""}
          maxLength={500}
        />
      </div>
    </>
  );
}
