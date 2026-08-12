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
          .uoa-fields {
            display: none;
          }

          .uoa-student-container:has(input[value="yes"]:checked) ~ .uoa-fields {
            display: block;
          }
        `}
      </style>

      <div>
        <div className="uoa-student-container">
          <fieldset>
            <legend>Are you a UoA Student?*</legend>

            {state?.error?.includes("registered") && (
              <p className="text-red-600 text-sm italic">{state.error}</p>
            )}

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
          </fieldset>
        </div>

        <div className="uoa-fields">
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
            />
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
            />
          </div>
        </div>
      </div>
    </>
  );
}
