"use client";

import Image from "next/image";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";
import TextField, { isValidEmail } from "../_components/TextField";
import OptionButton from "../_components/OptionButton";

export function StartPage({ fields }: { fields: Partial<RegistrationDraft> }) {
  const state = useFormError();
  const errorFields = state?.fields;
  const field = errorFields ?? fields;

  return (
    <>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <Image
          src="/logo.svg"
          alt="LUG@UoA logo"
          width={60}
          height={60}
          className="h-[60px] w-[60px] rounded-full"
        />
        <h2 className="m-0 text-[26px] leading-[1.2] font-black">
          Join LUG@UoA
        </h2>
        <p className="m-0 max-w-[460px] text-[15px] leading-[1.4] text-[var(--muted)]">
          A club where we build, share, and talk about Linux, the free and
          open-source operating system.
        </p>
      </div>

      <TextField
        name="email"
        label="Email"
        required
        type="email"
        placeholder="name@example.com"
        defaultValue={field?.email ?? ""}
        maxLength={254}
        hint="We'll send your invite here"
        validate={isValidEmail}
        okHint="✓ looks right"
        errorHint="Enter a valid email"
      />

      <fieldset className="m-0 border-none p-0">
        <legend className="mb-1.5 text-lg font-bold">
          Have you registered with us previously and meet all of these
          conditions?
          <span
            aria-hidden
            className="ml-[3px] font-extrabold text-[var(--danger)]"
          >
            *
          </span>
        </legend>

        <ul className="mb-2 list-disc pl-5 text-[15px] leading-[1.4] text-[var(--muted)]">
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

        <div className="flex gap-4">
          <OptionButton
            type="radio"
            name="isConditionalReturningMember"
            value="yes"
            label="Yes"
            className="flex-1"
            defaultChecked={field?.isConditionalReturningMember === "yes"}
            required
          />
          <OptionButton
            type="radio"
            name="isConditionalReturningMember"
            value="no"
            label="No"
            className="flex-1"
            defaultChecked={field?.isConditionalReturningMember === "no"}
            required
          />
        </div>

        <p className="mt-1.5 text-[15px] text-[var(--muted)]">
          If you are signing up for the first time, select “No”.
        </p>
      </fieldset>
    </>
  );
}
