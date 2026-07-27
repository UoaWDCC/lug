"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";
import { MAX_MAJORS } from "@/domain/member/constants";

export function NewUoaPage({ fields }: { fields: Partial<RegistrationDraft> }) {
  const state = useFormError();
  const errorFields = state?.fields;
  const field = errorFields ?? fields;

  const majorCount = Math.min(field?.majorCount ?? 1, MAX_MAJORS);

  return (
    <>
      <h2>Your student details with The University of Auckland</h2>
      <p>
        As a registered club at the University of Auckland, we are required to
        collect information about our members who are UoA students or
        staff.{" "}
      </p>

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

      <fieldset>
        <legend>What faculty or faculties are you enrolled in?*</legend>
        <p>If we miss your faculty, let us know!</p>

        <div>
          <label>
            <input
              type="checkbox"
              name="faculty"
              value="engineeringDesign"
              defaultChecked={field?.faculty?.includes("engineeringDesign")}
            />
            Faculty of Engineering & Design
          </label>

          <label>
            <input
              type="checkbox"
              name="faculty"
              value="science"
              defaultChecked={field?.faculty?.includes("science")}
            />
            Faculty of Science
          </label>

          <label>
            <input
              type="checkbox"
              name="faculty"
              value="artsEducation"
              defaultChecked={field?.faculty?.includes("artsEducation")}
            />
            Faculty of Arts & Education
          </label>

          <label>
            <input
              type="checkbox"
              name="faculty"
              value="business"
              defaultChecked={field?.faculty?.includes("business")}
            />
            Business School
          </label>

          <label>
            <input
              type="checkbox"
              name="faculty"
              value="law"
              defaultChecked={field?.faculty?.includes("law")}
            />
            Auckland Law School
          </label>

          <label>
            <input
              type="checkbox"
              name="faculty"
              value="medicalHealthScience"
              defaultChecked={field?.faculty?.includes("medicalHealthScience")}
            />
            Faculty of Medical and Health Sciences
          </label>

          <label>
            <input
              type="checkbox"
              name="faculty"
              value="liggins"
              defaultChecked={field?.faculty?.includes("liggins")}
            />
            Liggins Institute
          </label>

          <label>
            <input
              type="checkbox"
              name="faculty"
              value="bioengineering"
              defaultChecked={field?.faculty?.includes("bioengineering")}
            />
            Auckland Bioengineering Institute
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>What are you majoring/specialising in?</legend>
        <p>Majors are independent of the faculties you selected above.</p>

        {Array.from({ length: majorCount }).map((_, i) => (
          <div key={i}>
            <label htmlFor={`majors-${i}`} className="sr-only">
              Major/specialisation {i + 1}
            </label>
            <input
              type="text"
              name="majors"
              id={`majors-${i}`}
              placeholder="Your answer"
              defaultValue={field?.majors?.[i] ?? ""}
              maxLength={40}
            />
          </div>
        ))}

        <input type="hidden" name="majorCount" value={majorCount} />

        {majorCount < MAX_MAJORS && (
          <button type="submit" name="intent" value="addMajor">
            Add another major
          </button>
        )}
      </fieldset>

      <div>
        <label htmlFor="programme">
          What is your current programme of study?*
        </label>
        <p>
          e.g. Bachelor of Engineering (Honours), Bachelor of Science, Master of
          Arts, etc.
        </p>
        <input
          name="programme"
          id="programme"
          type="text"
          placeholder="Your answer"
          defaultValue={field?.programme ?? ""}
          maxLength={150}
          required
        />
      </div>

      <fieldset>
        <legend>What is your current year of study?</legend>
        <p>
          {
            "Note to those who have progressed from one degree to another at UoA (e.g. from undergrad to postgrad, from one Bachelor degree to another): Your year of study is based on your current degree, not the total number of years that you have accumulated at UoA.  For instance, if it is your first year doing a Master's degree after doing a Bachelor's degree, then you are at your 1st Year."
          }
        </p>
        <div>
          <label>
            <input
              type="radio"
              name="yearLevel"
              value="FIRST_YEAR"
              defaultChecked={field?.yearLevel === "FIRST_YEAR"}
              required
            />
            1st Year
          </label>

          <label>
            <input
              type="radio"
              name="yearLevel"
              value="SECOND_YEAR"
              defaultChecked={field?.yearLevel === "SECOND_YEAR"}
            />
            2nd Year
          </label>

          <label>
            <input
              type="radio"
              name="yearLevel"
              value="THIRD_YEAR"
              defaultChecked={field?.yearLevel === "THIRD_YEAR"}
            />
            3rd Year
          </label>

          <label>
            <input
              type="radio"
              name="yearLevel"
              value="FOURTH_YEAR"
              defaultChecked={field?.yearLevel === "FOURTH_YEAR"}
            />
            4th Year
          </label>

          <label>
            <input
              type="radio"
              name="yearLevel"
              value="FIFTH_YEAR_OR_LATER"
              defaultChecked={field?.yearLevel === "FIFTH_YEAR_OR_LATER"}
            />
            5th Year or later
          </label>

          <label>
            <input
              type="radio"
              name="yearLevel"
              value="GRADUATED_WITHIN_2_YEARS"
              defaultChecked={field?.yearLevel === "GRADUATED_WITHIN_2_YEARS"}
            />
            Graduated within 2 years
          </label>
        </div>
      </fieldset>
    </>
  );
}
