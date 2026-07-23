"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";

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

      <fieldset>
        <legend>Do you attend The University of Auckland (UoA)?*</legend>
        <div>
          <label>
            <input
              type="radio"
              name="isCurrentUoaStudent"
              value="yes"
              defaultChecked={field?.isCurrentUoaStudent === "yes"}
              required
            />
            Yes
          </label>

          <label>
            <input
              type="radio"
              name="isCurrentUoaStudent"
              value="no"
              defaultChecked={field?.isCurrentUoaStudent === "no"}
              required
            />
            No
          </label>
        </div>
      </fieldset>
    </>
  );
}
