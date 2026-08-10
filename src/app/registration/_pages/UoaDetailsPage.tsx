"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";
import { MAX_MAJORS } from "@/domain/member/constants";

export function UoaDetailsPage({
  fields,
}: {
  fields: Partial<RegistrationDraft>;
}) {
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

      <h2>Name & Email</h2>

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

      <div className="programme-years-wrapper">
        <fieldset>
          <legend>What type of programme are you in?*</legend>
          <div>
            <label>
              <input
                type="radio"
                name="programmeType"
                value="TFC_PRE_UNI"
                defaultChecked={field?.programmeType === "TFC_PRE_UNI"}
                required
              />
              TFC / Pre-Uni
            </label>

            <label>
              <input
                type="radio"
                name="programmeType"
                value="BACHELOR"
                defaultChecked={field?.programmeType === "BACHELOR"}
              />
              Bachelor
            </label>

            <label>
              <input
                type="radio"
                name="programmeType"
                value="MASTER"
                defaultChecked={field?.programmeType === "MASTER"}
              />
              Master
            </label>

            <label>
              <input
                type="radio"
                name="programmeType"
                value="PHD"
                defaultChecked={field?.programmeType === "PHD"}
              />
              PhD
            </label>

            <label>
              <input
                type="radio"
                name="programmeType"
                value="OTHER"
                defaultChecked={field?.programmeType === "OTHER"}
              />
              Other
            </label>
          </div>
        </fieldset>

        <fieldset className="years-remaining-group">
          <legend>How many years do you have remaining?*</legend>
          <div>
            <label>
              <input
                type="radio"
                name="yearsRemaining"
                value="0"
                defaultChecked={field?.yearsRemaining === 0}
                required
              />
              Less than 1
            </label>

            <label>
              <input
                type="radio"
                name="yearsRemaining"
                value="1"
                defaultChecked={field?.yearsRemaining === 1}
              />
              1
            </label>

            <label>
              <input
                type="radio"
                name="yearsRemaining"
                value="2"
                defaultChecked={field?.yearsRemaining === 2}
              />
              2
            </label>

            <label>
              <input
                type="radio"
                name="yearsRemaining"
                value="3"
                defaultChecked={field?.yearsRemaining === 3}
              />
              3
            </label>

            <label>
              <input
                type="radio"
                name="yearsRemaining"
                value="4"
                defaultChecked={field?.yearsRemaining === 4}
              />
              4
            </label>

            <label>
              <input
                type="radio"
                name="yearsRemaining"
                value="5"
                defaultChecked={field?.yearsRemaining === 5}
              />
              More than 4
            </label>
          </div>
        </fieldset>
      </div>

      <style>{`
        .years-remaining-group { display: none; }
        .programme-years-wrapper:has(input[value="BACHELOR"]:checked) .years-remaining-group {
          display: block;
        }
      `}</style>
    </>
  );
}
