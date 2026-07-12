"use client";

import { useFormError } from "../RegistrationForm";
import { RegistrationDraft } from "../types";

export function FinalPage({ fields }: { fields: Partial<RegistrationDraft> }) {
  const state = useFormError();
  const errorFields = state?.fields;
  const field = errorFields ?? fields;

  return (
    <>
      <h2>The Final Section</h2>
      <p>
        {
          "Some final questions from us about who you are, and what you're looking forward to!"
        }
      </p>

      <p>final section placeholder</p>

      <fieldset>
        <legend>How much do you currently know about Linux?*</legend>
        <p>
          {
            "Everyone is welcome, regardless of skill level or operating system choice!"
          }
        </p>
        <div>
          <label>
            <input
              type="radio"
              name="linuxSkillLevel"
              value="NOTHING"
              defaultChecked={field?.linuxSkillLevel === "NOTHING"}
              required
            />
            Nothing
          </label>
          <label>
            <input
              type="radio"
              name="linuxSkillLevel"
              value="AWARE_OF_EXISTENCE"
              defaultChecked={field?.linuxSkillLevel === "AWARE_OF_EXISTENCE"}
              required
            />
            I am aware of its existence
          </label>
          <label>
            <input
              type="radio"
              name="linuxSkillLevel"
              value="BEGINNER_USER"
              defaultChecked={field?.linuxSkillLevel === "BEGINNER_USER"}
              required
            />
            I consider myself a beginner user
          </label>
          <label>
            <input
              type="radio"
              name="linuxSkillLevel"
              value="REGULAR_USER"
              defaultChecked={field?.linuxSkillLevel === "REGULAR_USER"}
              required
            />
            I consider myself a regular user
          </label>
          <label>
            <input
              type="radio"
              name="linuxSkillLevel"
              value="POWER_USER"
              defaultChecked={field?.linuxSkillLevel === "POWER_USER"}
              required
            />
            I consider myself a power user
          </label>
          <label>
            <input
              type="radio"
              name="linuxSkillLevel"
              value="CONTRIBUTOR"
              defaultChecked={field?.linuxSkillLevel === "CONTRIBUTOR"}
              required
            />
            I maintain or contribute to software for GNU/Linux
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>What is your potential involvement in the LUG?</legend>
        <p>
          Checking any of these boxes will add you to our email newsletter. You
          can unsubscribe at any time by emailing lug.aucklanduni@gmail.com
        </p>

        <div>
          <label>
            <input
              type="checkbox"
              name="potentialInvolvement"
              value="ATTENDING"
              defaultChecked={field?.potentialInvolvement?.includes(
                "ATTENDING",
              )}
            />
            Attending events
          </label>
          <label>
            <input
              type="checkbox"
              name="potentialInvolvement"
              value="SPEAKING"
              defaultChecked={field?.potentialInvolvement?.includes("SPEAKING")}
            />
            Speaking at events
          </label>
          <label>
            <input
              type="checkbox"
              name="potentialInvolvement"
              value="EXECUTIVE"
              defaultChecked={field?.potentialInvolvement?.includes(
                "EXECUTIVE",
              )}
            />
            Being an executive
          </label>
          <label>
            <input
              type="checkbox"
              name="potentialInvolvement"
              value="PROJECTS"
              defaultChecked={field?.potentialInvolvement?.includes("PROJECTS")}
            />
            Participating in a software development project
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="discordUsername">
          What is your Discord username or handle?
        </label>
        <p>
          LUG@UoA hosts a Discord server. The link will be shown after
          submission.
        </p>
        <input
          name="discordUsername"
          id="discordUsername"
          type="text"
          placeholder="Your answer"
          defaultValue={field?.discordUsername || ""}
          maxLength={32}
        />
      </div>
    </>
  );
}
