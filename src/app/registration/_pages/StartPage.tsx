"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";

export function StartPage({ fields }: { fields: Partial<RegistrationDraft> }) {
  const state = useFormError();
  const errorFields = state?.fields;
  const field = errorFields ?? fields;

  return (
    <>
      <style>
        {`
          .upi-id-input {
            display: none;
          }

          input[type="radio"]:checked ~ .upi-id-input {
            display: block;
          }
        `}
      </style>

      <fieldset>
        <legend>Are you a UoA Student?*</legend>

        {state?.error?.includes("registered") && (
          <p className="text-red-600 text-sm italic">{state.error}</p>
        )}

        <div>
          <input
            type="radio"
            name="isCurrentUoaStudent"
            value="yes"
            defaultChecked={field?.isCurrentUoaStudent === "yes"}
            required
          />
          <label>Yes</label>

          <div className="upi-id-input">
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
          </div>

          <div className="upi-id-input">
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
          </div>

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
