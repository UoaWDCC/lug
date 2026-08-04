"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";
import TextField, {
  isValidStudentId,
  isValidUpi,
} from "../_components/TextField";
import OptionButton from "../_components/OptionButton";
import { MAX_FACULTIES, MAX_MAJORS } from "@/domain/member/constants";

/* Values must match the strings the server action stores on the draft. */
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
  "self-start rounded-lg border border-[var(--input-border)] bg-transparent px-3 py-1.5 font-mono text-xs font-semibold text-[var(--fg)] transition-[background,border-color,transform] duration-150 hover:border-[var(--accent)] hover:bg-[var(--row-hover-bg)] active:scale-[0.97]";

export function NewUoaPage({ fields }: { fields: Partial<RegistrationDraft> }) {
  const state = useFormError();
  const errorFields = state?.fields;
  const field = errorFields ?? fields;

  const majorCount = Math.min(field?.majorCount ?? 1, MAX_MAJORS);

  return (
    <>
      <h2 className="m-0 text-center text-[23px] font-black">Study details</h2>

      <p className="m-0 text-sm leading-[1.5] text-[var(--muted)]">
        As a registered club at the University of Auckland, we are required to
        collect information about our members who are UoA students or staff.
      </p>

      <TextField
        name="upi"
        label="What is your username/UPI?"
        required
        placeholder=""
        defaultValue={field?.upi ?? ""}
        pattern="[a-zA-Z]{3,4}[0-9]{3}"
        hint="Format: 3–4 letters + 3 digits, e.g. jbon007"
        validate={isValidUpi}
        okHint="✓ looks right"
        errorHint="Should look like jbon007"
      />

      <TextField
        name="studentId"
        label="And your student ID?"
        required
        placeholder=""
        defaultValue={field?.studentId ?? ""}
        pattern="[0-9]{9,10}"
        hint="Your 9–10 digit university ID"
        validate={isValidStudentId}
        okHint="✓ looks right"
        errorHint="Enter your 9–10 digit ID"
      />

      <fieldset className="m-0 border-none p-0">
        <legend className="mb-1.5 text-sm font-bold">
          What faculty or faculties are you enrolled in?
          <span
            aria-hidden
            className="ml-[3px] font-extrabold text-[var(--danger)]"
          >
            *
          </span>
        </legend>
        <p className="mb-2 text-xs text-[var(--muted)]">
          Select up to {MAX_FACULTIES}. If we miss your faculty, let us know
          below.
        </p>

        <div className="flex flex-col gap-2">
          {FACULTIES.map((faculty) => (
            <OptionButton
              key={faculty.value}
              type="checkbox"
              name="faculty"
              value={faculty.value}
              label={faculty.label}
              surfaceClassName="justify-start px-3.5 py-[11px] text-left"
              defaultChecked={field?.faculty?.includes(faculty.value)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="m-0 border-none p-0">
        <legend className="mb-1.5 text-sm font-bold">
          What are you majoring/specialising in?
        </legend>
        <p className="mb-2 text-xs leading-[1.5] text-[var(--muted)]">
          Majors are independent of the faculties you selected above.
        </p>

        <div className="flex flex-col gap-2">
          {Array.from({ length: majorCount }).map((_, i) => (
            <TextField
              key={i}
              name="majors"
              label={`Major/specialisation ${i + 1}`}
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
              + Add another major
            </button>
          )}
        </div>
      </fieldset>

      <div className="programme-years-wrapper flex flex-col gap-3.5">
        <fieldset className="m-0 border-none p-0">
          <legend className="mb-1.5 text-sm font-bold">
            What type of programme are you in?
            <span
              aria-hidden
              className="ml-[3px] font-extrabold text-[var(--danger)]"
            >
              *
            </span>
          </legend>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
            {PROGRAMME_TYPES.map((programme) => (
              <OptionButton
                key={programme.value}
                type="radio"
                name="programmeType"
                value={programme.value}
                label={programme.label}
                surfaceClassName="justify-center px-2 py-[11px] text-center text-[13px]"
                defaultChecked={field?.programmeType === programme.value}
                required
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="years-remaining-group m-0 border-none p-0">
          <legend className="mb-1.5 text-sm font-bold">
            How many years do you have remaining?
            <span
              aria-hidden
              className="ml-[3px] font-extrabold text-[var(--danger)]"
            >
              *
            </span>
          </legend>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(70px,1fr))] gap-2">
            {YEARS_REMAINING.map((year) => (
              <OptionButton
                key={year.value}
                type="radio"
                name="yearsRemaining"
                value={year.value}
                label={year.label}
                surfaceClassName="justify-center px-2 py-[11px] text-center text-[13px]"
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
