"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";

import { useRef } from "react";

export function NewUoaPage({ fields }: { fields: Partial<RegistrationDraft> }) {
  const state = useFormError();
  const errorFields = state?.fields;
  const field = errorFields ?? fields;

  /* Client JS enhancement:
   * Used to create a reference to the Other checkbox so it automatically checks when user enters text
   */
  const otherFacultyCheckboxRef = useRef<HTMLInputElement>(null);

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

          <label>
            <input
              ref={otherFacultyCheckboxRef}
              type="checkbox"
              name="faculty"
              value="other"
              defaultChecked={
                field?.faculty?.includes("other") ||
                Boolean(field?.otherFaculty?.trim())
              }
            />
            Other
          </label>

          <label htmlFor="otherFaculty" className="sr-only">
            Please specify other faculty
          </label>
          <input
            type="text"
            name="otherFaculty"
            id="otherFaculty"
            placeholder="Specify other"
            defaultValue={field?.otherFaculty || ""}
            onInput={(event) => {
              const userHasTypedSomething =
                event.currentTarget.value.trim().length > 0;

              if (userHasTypedSomething && otherFacultyCheckboxRef.current) {
                otherFacultyCheckboxRef.current.checked = true;
              }
            }}
          />
        </div>
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
              value="year1"
              defaultChecked={field?.yearLevel === "year1"}
              required
            />
            1st Year
          </label>

          <label>
            <input
              type="radio"
              name="yearLevel"
              value="year2"
              defaultChecked={field?.yearLevel === "year2"}
            />
            2nd Year
          </label>

          <label>
            <input
              type="radio"
              name="yearLevel"
              value="year3"
              defaultChecked={field?.yearLevel === "year3"}
            />
            3rd Year
          </label>

          <label>
            <input
              type="radio"
              name="yearLevel"
              value="year4"
              defaultChecked={field?.yearLevel === "year4"}
            />
            4th Year
          </label>

          <label>
            <input
              type="radio"
              name="yearLevel"
              value="year5Above"
              defaultChecked={field?.yearLevel === "year5Above"}
            />
            5th Year or later
          </label>

          <label>
            <input
              type="radio"
              name="yearLevel"
              value="yearGraduated"
              defaultChecked={field?.yearLevel === "yearGraduated"}
            />
            Graduated within 2 years
          </label>
        </div>
      </fieldset>
    </>
  );
}
