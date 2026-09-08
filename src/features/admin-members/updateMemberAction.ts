"use server";

import { redirect } from "next/navigation";
import {
  MAX_FACULTIES,
  MAX_LENGTHS,
  MAX_MAJORS,
  VALID_INVOLVEMENTS,
  VALID_PROGRAMME_TYPES,
  VALID_SKILL_LEVELS,
  VALID_YEARS_REMAINING,
} from "@/domain/member/constants";
import type {
  LinuxSkillLevel,
  PotentialInvolvement,
  ProgrammeType,
} from "@/domain/member/types";
import { requireAdmin } from "@/lib/auth/session";
import {
  updateMember,
  type MemberUpdateData,
} from "@/repositories/memberRepository";

export type UpdateMemberActionResult = {
  ok: false;
  error: "invalid_id" | "invalid_data" | "not_found" | "duplicate" | "database";
  message: string;
};

type ParsedUpdate =
  | { ok: true; id: number; data: MemberUpdateData }
  | { ok: false; result: UpdateMemberActionResult };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function updateMemberAction(
  formData: FormData,
): Promise<UpdateMemberActionResult> {
  // Server Actions can be called independently of the page, so authenticate
  // here even though the edit page also calls requireAdmin().
  await requireAdmin();

  const parsed = parseMemberUpdate(formData);
  if (!parsed.ok) {
    return parsed.result;
  }

  const result = await updateMember(parsed.id, parsed.data);
  if (!result.ok) {
    return repositoryError(result.error.type);
  }

  redirect("/admin/members");
}

function parseMemberUpdate(formData: FormData): ParsedUpdate {
  const id = Number(readText(formData, "id"));
  if (!Number.isInteger(id) || id <= 0) {
    return invalid("invalid_id", "The member ID is invalid.");
  }

  const firstName = readText(formData, "firstName")?.trim() ?? "";
  const lastName = readText(formData, "lastName")?.trim() ?? "";
  const email = readText(formData, "email")?.trim().toLowerCase() ?? "";
  const discordUsername = readOptionalText(formData, "discordUsername");

  if (!firstName || firstName.length > MAX_LENGTHS.firstName) {
    return invalid(
      "invalid_data",
      `First name is required and must be at most ${MAX_LENGTHS.firstName} characters.`,
    );
  }

  if (!lastName || lastName.length > MAX_LENGTHS.lastName) {
    return invalid(
      "invalid_data",
      `Last name is required and must be at most ${MAX_LENGTHS.lastName} characters.`,
    );
  }

  if (
    !email ||
    email.length > MAX_LENGTHS.email ||
    !EMAIL_PATTERN.test(email)
  ) {
    return invalid("invalid_data", "Enter a valid email address.");
  }

  if (
    discordUsername !== null &&
    discordUsername.length > MAX_LENGTHS.discordUsername
  ) {
    return invalid(
      "invalid_data",
      `Discord username must be at most ${MAX_LENGTHS.discordUsername} characters.`,
    );
  }

  const faculty = readTextList(formData, "faculty");
  if (faculty.length > MAX_FACULTIES) {
    return invalid(
      "invalid_data",
      `Select at most ${MAX_FACULTIES} faculties.`,
    );
  }

  const majors = readTextList(formData, "majors");
  if (
    majors.length > MAX_MAJORS ||
    majors.some((major) => major.length > MAX_LENGTHS.major)
  ) {
    return invalid(
      "invalid_data",
      `Enter at most ${MAX_MAJORS} majors, each no longer than ${MAX_LENGTHS.major} characters.`,
    );
  }

  const rawProgrammeType = readOptionalText(formData, "programmeType");
  if (rawProgrammeType !== null && !isProgrammeType(rawProgrammeType)) {
    return invalid("invalid_data", "Select a valid programme type.");
  }

  const rawYearsRemaining = readOptionalText(formData, "yearsRemaining");
  const yearsRemaining =
    rawYearsRemaining === null ? null : Number(rawYearsRemaining);
  if (
    yearsRemaining !== null &&
    (!Number.isInteger(yearsRemaining) ||
      !VALID_YEARS_REMAINING.includes(
        yearsRemaining as (typeof VALID_YEARS_REMAINING)[number],
      ))
  ) {
    return invalid("invalid_data", "Select a valid number of years remaining.");
  }

  const rawSkillLevel = readText(formData, "linuxSkillLevel");
  if (!isLinuxSkillLevel(rawSkillLevel)) {
    return invalid("invalid_data", "Select a valid Linux skill level.");
  }

  const potentialInvolvement = readTextList(formData, "potentialInvolvement");
  if (
    potentialInvolvement.length === 0 ||
    !potentialInvolvement.every(isPotentialInvolvement)
  ) {
    return invalid(
      "invalid_data",
      "Select at least one valid potential involvement option.",
    );
  }

  const primaryAffiliation = readOptionalText(formData, "primaryAffiliation");
  const nonUoaExcerpt = readOptionalText(formData, "nonUoaExcerpt");
  const nonUoaPitch = readOptionalText(formData, "nonUoaPitch");

  if (
    primaryAffiliation !== null &&
    primaryAffiliation.length > MAX_LENGTHS.primaryAffiliation
  ) {
    return invalid(
      "invalid_data",
      `Primary affiliation must be at most ${MAX_LENGTHS.primaryAffiliation} characters.`,
    );
  }

  if (
    nonUoaExcerpt !== null &&
    nonUoaExcerpt.length > MAX_LENGTHS.nonUoaExcerpt
  ) {
    return invalid(
      "invalid_data",
      `Non-UoA excerpt must be at most ${MAX_LENGTHS.nonUoaExcerpt} characters.`,
    );
  }

  if (nonUoaPitch !== null && nonUoaPitch.length > MAX_LENGTHS.nonUoaPitch) {
    return invalid(
      "invalid_data",
      `Non-UoA pitch must be at most ${MAX_LENGTHS.nonUoaPitch} characters.`,
    );
  }

  return {
    ok: true,
    id,
    data: {
      firstName,
      lastName,
      email,
      discordUsername,
      faculty,
      programmeType: rawProgrammeType,
      majors,
      yearsRemaining,
      linuxSkillLevel: rawSkillLevel,
      potentialInvolvement,
      primaryAffiliation,
      nonUoaExcerpt,
      nonUoaPitch,
    },
  };
}

function readText(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" ? value : null;
}

function readOptionalText(formData: FormData, name: string): string | null {
  const value = readText(formData, name)?.trim() ?? "";
  return value === "" ? null : value;
}

function readTextList(formData: FormData, name: string): string[] {
  return formData
    .getAll(name)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value !== "");
}

function isProgrammeType(value: string): value is ProgrammeType {
  return VALID_PROGRAMME_TYPES.includes(value as ProgrammeType);
}

function isLinuxSkillLevel(value: string | null): value is LinuxSkillLevel {
  return (
    value !== null && VALID_SKILL_LEVELS.includes(value as LinuxSkillLevel)
  );
}

function isPotentialInvolvement(value: string): value is PotentialInvolvement {
  return VALID_INVOLVEMENTS.includes(value as PotentialInvolvement);
}

//helper for generating error report object
function invalid(
  error: "invalid_id" | "invalid_data",
  message: string,
): { ok: false; result: UpdateMemberActionResult } {
  return { ok: false, result: { ok: false, error, message } };
}

function repositoryError(
  error: "not_found" | "duplicate" | "database",
): UpdateMemberActionResult {
  switch (error) {
    case "not_found":
      return {
        ok: false,
        error,
        message: "The member could not be found.",
      };
    case "duplicate":
      return {
        ok: false,
        error,
        message: "That email is already used by another registration.",
      };
    case "database":
      return {
        ok: false,
        error,
        message: "The member could not be updated. Please try again.",
      };
  }
}
