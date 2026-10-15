import { z } from "zod";

import { UnvalidatedMemberSubmission, MemberRegistration } from "./types";
import {
  MAX_LENGTHS,
  VALID_INVOLVEMENTS,
  VALID_SKILL_LEVELS,
  VALID_FACULTIES,
  MAX_FACULTIES,
  VALID_PROGRAMME_TYPES,
  MAX_MAJORS,
  VALID_YEARS_REMAINING,
} from "./constants";

type RegistrationFormValidationError = {
  message: string;
};

const BaseMemberSchema = z.object({
  firstName: z
    .string()
    .min(1, "First Name is required.")
    .max(
      MAX_LENGTHS.firstName,
      `First Name must be under ${MAX_LENGTHS.firstName} characters.`,
    ),
  lastName: z
    .string()
    .min(1, "Last Name is required.")
    .max(
      MAX_LENGTHS.lastName,
      `Last Name must be under ${MAX_LENGTHS.lastName} characters.`,
    ),
  email: z
    .email()
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please enter a valid email address (e.g., name@example.com).",
    )
    .max(
      MAX_LENGTHS.email,
      `Email must be under ${MAX_LENGTHS.email} characters.`,
    ),
  discordUsername: z
    .string()
    .max(
      MAX_LENGTHS.discordUsername,
      `Discord username must be under ${MAX_LENGTHS.discordUsername} characters.`,
    )
    .optional()
    .nullable(),
  linuxSkillLevel: z.enum(VALID_SKILL_LEVELS, {
    error: "Please select a valid Linux knowledge level.",
  }),
  potentialInvolvement: z
    .array(
      z.enum(VALID_INVOLVEMENTS, {
        error: "Invalid involvement option selected.",
      }),
    )
    .min(1, "Please select at least 1 involvement."),
});

const CurrentUoaMemberSchema = BaseMemberSchema.extend({
  isCurrentUoaStudent: z.literal("yes"),
  upi: z
    .string()
    .min(1, "UPI is required.")
    .regex(/^[a-z]{3,4}\d{3}$/i, "Invalid UPI format (e.g., abcd123)."),
  studentId: z
    .string()
    .min(1, "Student ID is required.")
    .regex(/^\d{9,10}$/, "Student ID must be 9-10 digits."),
  faculty: z
    .array(
      z.enum(VALID_FACULTIES, {
        error: "Please select a valid faculty.",
      }),
    )
    .min(1, "Please select at least 1 faculty.")
    .max(MAX_FACULTIES, `Please select at most ${MAX_FACULTIES} faculties.`),
  programmeType: z.enum(VALID_PROGRAMME_TYPES, {
    error: "Please select a programme type.",
  }),
  majors: z
    .array(
      z
        .string()
        .max(
          MAX_LENGTHS.major,
          `Each major must be under ${MAX_LENGTHS.major} characters.`,
        ),
    )
    .max(MAX_MAJORS, `Please enter at most ${MAX_MAJORS} majors.`)
    .default([]),
  yearsRemaining: z.number().optional().nullable(),
})
  .superRefine((data, ctx) => {
    if (
      data.programmeType === "BACHELOR" &&
      (data.yearsRemaining == null || isNaN(data.yearsRemaining))
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Please select how many years you have remaining.",
        path: ["yearsRemaining"],
      });
    }
  })
  .transform((data) => ({
    ...data,
    isCurrentUoaStudent: true as const,
  }));

const NonCurrentUoaStudentMemberSchema = BaseMemberSchema.extend({
  isCurrentUoaStudent: z.literal("no"),
  primaryAffiliation: z
    .string()
    .min(1, "Primary Affiliation is required.")
    .max(
      MAX_LENGTHS.primaryAffiliation,
      `Primary affiliation must be under ${MAX_LENGTHS.primaryAffiliation} characters.`,
    ),
  nonUoaExcerpt: z
    .string()
    .max(
      MAX_LENGTHS.nonUoaExcerpt,
      `That's a bit long — please keep it under ${MAX_LENGTHS.nonUoaExcerpt} characters.`,
    )
    .optional()
    .nullable(),
  nonUoaPitch: z
    .string()
    .max(
      MAX_LENGTHS.nonUoaPitch,
      `That's a bit long — please keep it under ${MAX_LENGTHS.nonUoaPitch} characters.`,
    )
    .optional()
    .nullable(),
}).transform((data) => ({
  ...data,
  isCurrentUoaStudent: false as const,
}));

const MemberRegistrationSchema = z.discriminatedUnion("isCurrentUoaStudent", [
  CurrentUoaMemberSchema,
  NonCurrentUoaStudentMemberSchema,
]);

export function validateMemberRegistration(
  submission: UnvalidatedMemberSubmission,
):
  | { ok: true; data: MemberRegistration }
  | { ok: false; error: RegistrationFormValidationError } {
  const input = {
    ...submission,
    majors: submission.majors ?? [],
    yearsRemaining: submission.yearsRemaining ?? undefined,
    nonUoaExcerpt: submission.nonUoaExcerpt ?? undefined,
    nonUoaPitch: submission.nonUoaPitch ?? undefined,
    potentialInvolvement: submission.potentialInvolvement ?? [],
    discordUsername: submission.discordUsername ?? undefined,
  };

  const result = MemberRegistrationSchema.safeParse(input);

  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      ok: false,
      error: { message: firstError.message },
    };
  }

  return {
    ok: true,
    data: result.data as MemberRegistration,
  };
}

/* UpdateMemberSchema and Helpers */

// Admin edit form: every field is submitted flat regardless of member type,
// with blank optional inputs arriving as empty strings.
const blankToNull = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const toTextList = (value: unknown) =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => item !== "")
    : [];

const optionalText = (maxLength: number, message: string) =>
  z.preprocess(blankToNull, z.string().max(maxLength, message).nullable());

export const UpdateMemberSchema = z.object({
  firstName: z
    .string({
      error: `First name is required and must be at most ${MAX_LENGTHS.firstName} characters.`,
    })
    .trim()
    .min(
      1,
      `First name is required and must be at most ${MAX_LENGTHS.firstName} characters.`,
    )
    .max(
      MAX_LENGTHS.firstName,
      `First name is required and must be at most ${MAX_LENGTHS.firstName} characters.`,
    ),
  lastName: z
    .string({
      error: `Last name is required and must be at most ${MAX_LENGTHS.lastName} characters.`,
    })
    .trim()
    .min(
      1,
      `Last name is required and must be at most ${MAX_LENGTHS.lastName} characters.`,
    )
    .max(
      MAX_LENGTHS.lastName,
      `Last name is required and must be at most ${MAX_LENGTHS.lastName} characters.`,
    ),
  email: z
    .string({ error: "Enter a valid email address." })
    .trim()
    .toLowerCase()
    .pipe(
      z
        .email("Enter a valid email address.")
        .max(MAX_LENGTHS.email, "Enter a valid email address."),
    ),
  discordUsername: optionalText(
    MAX_LENGTHS.discordUsername,
    `Discord username must be at most ${MAX_LENGTHS.discordUsername} characters.`,
  ),
  faculty: z.preprocess(
    toTextList,
    z
      .array(z.enum(VALID_FACULTIES, { error: "Select a valid faculty." }))
      .max(MAX_FACULTIES, `Select at most ${MAX_FACULTIES} faculties.`),
  ),
  programmeType: z.preprocess(
    blankToNull,
    z
      .enum(VALID_PROGRAMME_TYPES, { error: "Select a valid programme type." })
      .nullable(),
  ),
  majors: z.preprocess(
    toTextList,
    z
      .array(
        z
          .string()
          .max(
            MAX_LENGTHS.major,
            `Enter at most ${MAX_MAJORS} majors, each no longer than ${MAX_LENGTHS.major} characters.`,
          ),
      )
      .max(
        MAX_MAJORS,
        `Enter at most ${MAX_MAJORS} majors, each no longer than ${MAX_LENGTHS.major} characters.`,
      ),
  ),
  yearsRemaining: z.preprocess(
    (value) => {
      const text = blankToNull(value);
      return text === null ? null : Number(text);
    },
    z
      .literal(VALID_YEARS_REMAINING, {
        error: "Select a valid number of years remaining.",
      })
      .nullable(),
  ),
  linuxSkillLevel: z.enum(VALID_SKILL_LEVELS, {
    error: "Select a valid Linux skill level.",
  }),
  potentialInvolvement: z.preprocess(
    toTextList,
    z
      .array(
        z.enum(VALID_INVOLVEMENTS, {
          error: "Select at least one valid potential involvement option.",
        }),
      )
      .min(1, "Select at least one valid potential involvement option."),
  ),
  primaryAffiliation: optionalText(
    MAX_LENGTHS.primaryAffiliation,
    `Primary affiliation must be at most ${MAX_LENGTHS.primaryAffiliation} characters.`,
  ),
  nonUoaExcerpt: optionalText(
    MAX_LENGTHS.nonUoaExcerpt,
    `Non-UoA excerpt must be at most ${MAX_LENGTHS.nonUoaExcerpt} characters.`,
  ),
  nonUoaPitch: optionalText(
    MAX_LENGTHS.nonUoaPitch,
    `Non-UoA pitch must be at most ${MAX_LENGTHS.nonUoaPitch} characters.`,
  ),
});
