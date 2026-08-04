"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";
import TextField from "../_components/TextField";
import OptionButton from "../_components/OptionButton";
import SkillSlider from "../_components/SkillSlider";

/* Values must match VALID_INVOLVEMENTS in @/domain/member/constants. */
const INVOLVEMENTS = [
  { value: "ATTENDING", label: "Attending events" },
  { value: "SPEAKING", label: "Speaking at events" },
  { value: "EXECUTIVE", label: "Being an executive" },
  { value: "PROJECTS", label: "Software projects" },
];

export function FinalPage({ fields }: { fields: Partial<RegistrationDraft> }) {
  const state = useFormError();
  const errorFields = state?.fields;
  const field = errorFields ?? fields;

  return (
    <>
      <h2 className="m-0 text-center text-[23px] font-black">
        Your Linux journey
      </h2>

      <SkillSlider defaultValue={field?.linuxSkillLevel} />

      <fieldset className="m-0 border-none p-0">
        <legend className="mb-1.5 text-sm font-bold">
          What is your potential involvement in the LUG?
          <span
            aria-hidden
            className="ml-[3px] font-extrabold text-[var(--danger)]"
          >
            *
          </span>
        </legend>
        <p className="mb-2 text-xs leading-[1.5] text-[var(--muted)]">
          Pick at least one. Checking any of these adds you to our email
          newsletter - you can unsubscribe any time by emailing
          lug.aucklanduni@gmail.com.
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
          {INVOLVEMENTS.map((involvement) => (
            <OptionButton
              key={involvement.value}
              type="checkbox"
              name="potentialInvolvement"
              value={involvement.value}
              label={involvement.label}
              surfaceClassName="justify-start px-2 py-3 text-left text-[13px]"
              defaultChecked={field?.potentialInvolvement?.includes(
                involvement.value,
              )}
            />
          ))}
        </div>
      </fieldset>

      <TextField
        name="discordUsername"
        label="What is your Discord username or handle?"
        description="LUG@UoA hosts a Discord server. The invite link is shown after you submit."
        placeholder="username"
        defaultValue={field?.discordUsername ?? ""}
        maxLength={32}
      />
    </>
  );
}
