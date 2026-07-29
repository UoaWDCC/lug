"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";

export function StartPage({ fields }: { fields: Partial<RegistrationDraft> }) {
  const state = useFormError();
  const errorFields = state?.fields;
  const field = errorFields ?? fields;

  return (
    <>
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
          required
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
          required
        />
      </div>
    </>
  );
}
