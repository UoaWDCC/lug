"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";
import TextField from "../_components/TextField";
import OptionButton from "../_components/OptionButton";
import { MAX_MAJORS } from "@/domain/member/constants";

const FACULTIES = [
  { value: "engineeringDesign", label: "Faculty of Engineering & Design" },
  { value: "science", label: "Faculty of Science" },
  { value: "artsEducation", label: "Faculty of Arts & Education" },
  { value: "business", label: "Business School" },
  { value: "law", label: "Auckland Law School" },
  {
    value: "medicalHealthScience",
    label: "Faculty of Medical and Health Sciences",
  },
  { value: "liggins", label: "Liggins Institute" },
  { value: "bioengineering", label: "Auckland Bioengineering Institute" },
];

const PROGRAMME_TYPES = [
  { value: "TFC_PRE_UNI", label: "TFC / Pre-Uni" },
  { value: "BACHELOR", label: "Bachelor" },
  { value: "MASTER", label: "Master" },
  { value: "PHD", label: "PhD" },
  { value: "OTHER", label: "Other" },
];

const YEARS_REMAINING = [
  { value: "0", label: "Less than 1" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "More than 4" },
];

const addMajorButtonClass =
  "self-start rounded-lg border border-[var(--input-border)] bg-transparent px-3.5 py-2 font-mono text-[15px] font-semibold text-[var(--fg)] transition-[background,border-color,transform] duration-150 hover:border-[var(--accent)] hover:bg-[var(--row-hover-bg)] active:scale-[0.97]";

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
      <h2 className="m-0 text-[26px] font-black">
        Your student details with The University of Auckland
      </h2>
      <p className="m-0 text-[15px] leading-[1.4] text-[var(--muted)]">
        As a registered club at the University of Auckland, we are required to
        collect information about our members who are UoA students or staff.
      </p>

      <h2 className="m-0 text-[22px] font-black">Name & Email</h2>

      <TextField
        name="firstName"
        label="What is your first name?"
        required
        placeholder="Your answer"
        defaultValue={field?.firstName ?? ""}
        maxLength={100}
      />

      <TextField
        name="lastName"
        label="And your last name?"
        description="If you do not have a last name, type N/A."
        required
        placeholder="Your answer"
        defaultValue={field?.lastName ?? ""}
        maxLength={100}
      />

      <TextField
        name="email"
        label="Email"
        type="email"
        placeholder="name@example.com"
        defaultValue={field?.email || ""} // This is what prevents the clearing
        maxLength={254}
        error={state?.error?.includes("email") ? state.error : undefined}
      />

      <fieldset className="m-0 border-none p-0">
        <legend className="mb-2 text-lg font-bold">
          What faculty or faculties are you enrolled in?
          <span
            aria-hidden
            className="ml-[3px] font-extrabold text-[var(--danger)]"
          >
            *
          </span>
        </legend>
        <p className="mb-2.5 text-[15px] text-[var(--muted)]">
          If we miss your faculty, let us know!
        </p>

        <div className="flex flex-col gap-2.5">
          {FACULTIES.map((faculty) => (
            <OptionButton
              key={faculty.value}
              type="checkbox"
              name="faculty"
              value={faculty.value}
              label={faculty.label}
              surfaceClassName="justify-start px-4 py-3.5 text-left"
              defaultChecked={field?.faculty?.includes(faculty.value)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="m-0 border-none p-0">
        <legend className="mb-2 text-lg font-bold">
          What are you majoring/specialising in?
        </legend>
        <p className="mb-2.5 text-[15px] leading-[1.5] text-[var(--muted)]">
          Majors are independent of the faculties you selected above.
        </p>

        <div className="flex flex-col gap-2.5">
          {Array.from({ length: majorCount }).map((_, i) => (
            <TextField
              key={i}
              name="majors"
              label={`Major/specialisation ${i + 1}`}
              hideLabel
              placeholder="Your answer"
              defaultValue={field?.majors?.[i] ?? ""}
              maxLength={40}
            />
          ))}

          <input type="hidden" name="majorCount" value={majorCount} />

          {majorCount < MAX_MAJORS && (
            <button
              type="submit"
              name="intent"
              value="addMajor"
              className={addMajorButtonClass}
            >
              Add another major
            </button>
          )}
        </div>
      </fieldset>

      <div className="programme-years-wrapper flex flex-col gap-4">
        <fieldset className="m-0 border-none p-0">
          <legend className="mb-2 text-lg font-bold">
            What type of programme are you in?
            <span
              aria-hidden
              className="ml-[3px] font-extrabold text-[var(--danger)]"
            >
              *
            </span>
          </legend>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2.5">
            {PROGRAMME_TYPES.map((programme) => (
              <OptionButton
                key={programme.value}
                type="radio"
                name="programmeType"
                value={programme.value}
                label={programme.label}
                surfaceClassName="justify-center px-2.5 py-3.5 text-center text-base"
                defaultChecked={field?.programmeType === programme.value}
                required
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="years-remaining-group m-0 border-none p-0">
          <legend className="mb-2 text-lg font-bold">
            How many years do you have remaining?
            <span
              aria-hidden
              className="ml-[3px] font-extrabold text-[var(--danger)]"
            >
              *
            </span>
          </legend>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(78px,1fr))] gap-2.5">
            {YEARS_REMAINING.map((year) => (
              <OptionButton
                key={year.value}
                type="radio"
                name="yearsRemaining"
                value={year.value}
                label={year.label}
                surfaceClassName="justify-center px-2.5 py-3.5 text-center text-base"
                defaultChecked={field?.yearsRemaining === Number(year.value)}
              />
            ))}
          </div>
        </fieldset>
      </div>

      {/* Pure CSS so the conditional reveal works without JS. */}
      <style>{`
        .years-remaining-group { display: none; }
        .programme-years-wrapper:has(input[value="BACHELOR"]:checked) .years-remaining-group {
          display: block;
        }
      `}</style>
    </>
  );
}
