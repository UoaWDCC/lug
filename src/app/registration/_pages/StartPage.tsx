"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";

export function StartPage({ fields }: { fields: Partial<RegistrationDraft> }) {
  const state = useFormError();
  const errorFields = state?.fields;
  const field = errorFields ?? fields;

  return (
    <>
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

      <fieldset>
        <legend>
          Have you registered with us previously and meet the following
          conditions?*
        </legend>

        <ul>
          <li>You are a current student at the University of Auckland</li>
          <li>
            You previously gave us your UPI or Student ID when registering your
            interest in 2025
          </li>
          <li>
            You have not changed your programme of study since your last
            application
          </li>
        </ul>

        <p>
          <i>
            {"If you are signing up for the first time, you should select 'no'"}
          </i>
        </p>

        {state?.error?.includes("registered") && (
          <p className="text-red-600 text-sm italic">{state.error}</p>
        )}

        <div>
          <label>
            <input
              type="radio"
              name="isConditionalReturningMember"
              value="yes"
              defaultChecked={field?.isConditionalReturningMember === "yes"}
              required
            />
            Yes
          </label>

          <label>
            <input
              type="radio"
              name="isConditionalReturningMember"
              value="no"
              defaultChecked={field?.isConditionalReturningMember === "no"}
              required
            />
            No
          </label>
        </div>
      </fieldset>
    </>
  );
}
