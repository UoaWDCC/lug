"use server";

import {
  RegistrationPage,
  RegistrationDraft,
  RegistrationFormState,
} from "./types";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  VALID_PAGES,
  readRegistrationDraft,
  normalizeLowercase,
  normalizeText,
} from "./utils";

import {
  VALID_INVOLVEMENTS,
  VALID_SKILL_LEVELS,
  VALID_FACULTIES,
  VALID_PROGRAMME_TYPES,
  VALID_YEARS_REMAINING,
  MAX_LENGTHS,
  MAX_FACULTIES,
  MAX_MAJORS,
} from "@/domain/member/constants";

import {
  Faculty,
  LinuxSkillLevel,
  PotentialInvolvement,
  ProgrammeType,
  UnvalidatedMemberSubmission,
} from "@/domain/member/types";

import { exceedsMax } from "@/domain/member/exceedsMax";

import { submitMemberRegistration } from "@/features/membership-registration/submitMemberRegistration";
import { findMemberByUpiAndStudentId } from "@/repositories/memberRepository";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/registration",
};

function stripIrrelevantFields(
  draft: Partial<RegistrationDraft>,
): Partial<RegistrationDraft> {
  const stack = draft.pageStack ?? [];
  const lastPage = stack.at(-1) ?? "start";

  const { page, pageStack, ...draftFields } = draft;

  if (lastPage == "uoaDetails") {
    const { primaryAffiliation, nonUoaExcerpt, nonUoaPitch, ...stripped } =
      draftFields;
    return stripped;
  } else {
    const {
      upi,
      studentId,
      faculty,
      majors,
      majorCount,
      programmeType,
      yearsRemaining,
      ...stripped
    } = draftFields;
    return stripped;
  }
}

function toParsedSubmission(
  draft: Partial<RegistrationDraft>,
): UnvalidatedMemberSubmission {
  return {
    firstName: normalizeText(draft.firstName),
    lastName: normalizeText(draft.lastName),
    email: normalizeLowercase(draft.email),
    isCurrentUoaStudent: draft.isCurrentUoaStudent ?? null,
    upi: normalizeLowercase(draft.upi),
    studentId: normalizeText(draft.studentId),
    faculty: draft.faculty ?? [],
    majors: draft.majors ?? [],
    programmeType: draft.programmeType ?? null,
    yearsRemaining: draft.yearsRemaining,
    primaryAffiliation: normalizeText(draft.primaryAffiliation),
    nonUoaExcerpt: normalizeText(draft.nonUoaExcerpt),
    nonUoaPitch: normalizeText(draft.nonUoaPitch),
    linuxSkillLevel: draft.linuxSkillLevel ?? null,
    potentialInvolvement: draft.potentialInvolvement ?? [],
    discordUsername: normalizeText(draft.discordUsername),
  };
}

export async function submitRegistrationStep(
  prevState: RegistrationFormState,
  formData: FormData,
) {
  const cookieStore = await cookies();

  // Load previously saved data
  const raw = cookieStore.get("formState")?.value;
  const prev = readRegistrationDraft(raw);

  // Handle back navigation if required
  const intent = formData.get("intent") as string;
  if (intent == "back" && prev.pageStack) {
    const stack = prev.pageStack ?? [];
    const goTo = stack.at(-1) ?? "start";
    const newDraft = { ...prev, page: goTo, pageStack: stack.slice(0, -1) };

    cookieStore.set("formState", JSON.stringify(newDraft), COOKIE_OPTIONS);
    redirect("/registration");
  }

  /*
   * Mainly for robustness: redirect if submitted pageValue is not valid
   * This can happen since server actions can be reached externally through direct POST requests
   */
  const pageValue = formData.get("page");

  if (
    typeof pageValue !== "string" ||
    !VALID_PAGES.includes(pageValue as RegistrationPage)
  ) {
    redirect("/registration");
  }

  const page = pageValue as RegistrationPage;

  let nextPage: RegistrationPage = "start";
  let stepData: Partial<RegistrationDraft> = {};

  // Validate data based on page
  switch (page) {
    case "start": {
      const upiRegex = /^[a-z]{3,4}\d{3}$/i;
      const studentIdRegex = /^\d{9,10}$/;

      const isCurrentUoaStudent = formData.get("isCurrentUoaStudent") as string;
      const upi = formData.get("upi") as string;
      const studentId = formData.get("studentId") as string;
      const fields = { isCurrentUoaStudent, upi, studentId };

      if (isCurrentUoaStudent !== "yes" && isCurrentUoaStudent !== "no") {
        return {
          error:
            "Please select whether you attend the University of Auckland (UoA).",
          fields,
        };
      }

      if (isCurrentUoaStudent === "yes") {
        if (!upi) {
          return { error: "UPI is required.", fields };
        }
        if (!upiRegex.test(upi)) {
          return { error: "Invalid UPI format (e.g., abcd123).", fields };
        }
        if (!studentId) {
          return { error: "Student ID is required.", fields };
        }
        if (!studentIdRegex.test(studentId)) {
          return { error: "Student ID must be 9-10 digits.", fields };
        }

        const existingMember = await findMemberByUpiAndStudentId(
          upi,
          studentId,
        );
        if (existingMember) {
          stepData = {
            ...fields,
            firstName: existingMember.firstName,
            lastName: existingMember.lastName,
            email: existingMember.email,
            isConditionalReturningMember: "yes",
            faculty: existingMember.faculty ?? [],
            majors: existingMember.majors ?? [],
            majorCount: Math.max(existingMember.majors?.length ?? 1, 1),
            programmeType: existingMember.programmeType ?? undefined,
            yearsRemaining: existingMember.yearsRemaining ?? undefined,
          };
        } else {
          stepData = {
            ...fields,
            firstName: undefined,
            lastName: undefined,
            email: undefined,
            isConditionalReturningMember: undefined,
            faculty: undefined,
            majors: undefined,
            majorCount: undefined,
            programmeType: undefined,
            yearsRemaining: undefined,
          };
        }
      } else {
        stepData = {
          ...fields,
          firstName: undefined,
          lastName: undefined,
          email: undefined,
          isConditionalReturningMember: undefined,
          faculty: undefined,
          majors: undefined,
          majorCount: undefined,
          programmeType: undefined,
          yearsRemaining: undefined,
        };
      }

      nextPage = isCurrentUoaStudent === "yes" ? "uoaDetails" : "newNonUoa";
      break;
    }
    case "uoaDetails": {
      const firstName = formData.get("firstName") as string;
      const lastName = formData.get("lastName") as string;
      const email = formData.get("email") as string;
      const faculty = formData.getAll("faculty") as string[];
      const majors = (formData.getAll("majors") as string[])
        .map((major) => major.trim())
        .filter((major) => major !== "");
      const majorCount = Math.min(
        Number(formData.get("majorCount")) || prev.majorCount || 1,
        MAX_MAJORS,
      );

      const programmeType = formData.get("programmeType") as string;
      const yearsRemaining =
        programmeType === "BACHELOR"
          ? Number(formData.get("yearsRemaining"))
          : undefined;

      const fields = {
        firstName,
        lastName,
        email,
        faculty,
        majors,
        majorCount,
        programmeType,
        yearsRemaining,
      };

      if (intent == "addMajor") {
        const newDraft: Partial<RegistrationDraft> = {
          ...prev,
          ...fields,
          majorCount: Math.min(majorCount + 1, MAX_MAJORS),
        };

        cookieStore.set("formState", JSON.stringify(newDraft), COOKIE_OPTIONS);
        redirect("/registration");
      }

      if (!firstName) {
        return { error: "First name is required.", fields };
      }

      if (exceedsMax(firstName, "firstName")) {
        return {
          error: `First name must be under ${MAX_LENGTHS.firstName} characters.`,
          fields,
        };
      }

      if (!lastName) {
        return { error: "Last name is required.", fields };
      }

      if (exceedsMax(lastName, "lastName")) {
        return {
          error: `Last name must be under ${MAX_LENGTHS.lastName} characters.`,
          fields,
        };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return {
          error: "Please enter a valid email address (e.g., name@example.com).",
          fields,
        };
      }

      if (exceedsMax(email, "email")) {
        return {
          error: `Your email must be under ${MAX_LENGTHS.email} characters.`,
          fields,
        };
      }

      if (faculty.length == 0) {
        return { error: "Please select at least 1 faculty.", fields };
      }

      if (faculty.length > MAX_FACULTIES) {
        return {
          error: `Please select at most ${MAX_FACULTIES} faculties.`,
          fields,
        };
      }

      if (!faculty.every((f) => VALID_FACULTIES.includes(f as Faculty))) {
        return { error: "Please select a valid faculty.", fields };
      }

      if (majors.length > MAX_MAJORS) {
        return {
          error: `Please enter at most ${MAX_MAJORS} majors.`,
          fields,
        };
      }

      if (majors.some((major) => exceedsMax(major, "major"))) {
        return {
          error: `Each major must be under ${MAX_LENGTHS.major} characters.`,
          fields,
        };
      }

      if (
        !programmeType ||
        !VALID_PROGRAMME_TYPES.includes(programmeType as ProgrammeType)
      ) {
        return { error: "Please select a programme type.", fields };
      }

      if (programmeType === "BACHELOR") {
        if (
          isNaN(yearsRemaining as number) ||
          !VALID_YEARS_REMAINING.includes(
            yearsRemaining as (typeof VALID_YEARS_REMAINING)[number],
          )
        ) {
          return {
            error: "Please select how many years you have remaining.",
            fields,
          };
        }
      }

      stepData = fields;
      nextPage = "final";
      break;
    }
    case "newNonUoa": {
      const firstName = formData.get("firstName") as string;
      const lastName = formData.get("lastName") as string;
      const email = formData.get("email") as string;
      const primaryAffiliation = formData.get("primaryAffiliation") as string;
      const nonUoaExcerpt = formData.get("nonUoaExcerpt") as string;
      const nonUoaPitch = formData.get("nonUoaPitch") as string;
      const fields = {
        firstName,
        lastName,
        email,
        primaryAffiliation,
        nonUoaExcerpt,
        nonUoaPitch,
      };

      if (!firstName) {
        return { error: "First name is required.", fields };
      }

      if (exceedsMax(firstName, "firstName")) {
        return {
          error: `First name must be under ${MAX_LENGTHS.firstName} characters.`,
          fields,
        };
      }

      if (!lastName) {
        return { error: "Last name is required.", fields };
      }

      if (exceedsMax(lastName, "lastName")) {
        return {
          error: `Last name must be under ${MAX_LENGTHS.lastName} characters.`,
          fields,
        };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return {
          error: "Please enter a valid email address (e.g., name@example.com).",
          fields,
        };
      }

      if (exceedsMax(email, "email")) {
        return {
          error: `Your email must be under ${MAX_LENGTHS.email} characters.`,
          fields,
        };
      }

      if (!primaryAffiliation) {
        return { error: "Primary Affiliation is required.", fields };
      }

      if (exceedsMax(primaryAffiliation, "primaryAffiliation")) {
        return {
          error: `Primary affiliation must be under ${MAX_LENGTHS.primaryAffiliation} characters.`,
          fields,
        };
      }

      if (exceedsMax(nonUoaExcerpt, "nonUoaExcerpt")) {
        return {
          error: `That's a bit long — please keep it under ${MAX_LENGTHS.nonUoaExcerpt} characters.`,
          fields,
        };
      }

      if (exceedsMax(nonUoaPitch, "nonUoaPitch")) {
        return {
          error: `That's a bit long — please keep it under ${MAX_LENGTHS.nonUoaPitch} characters.`,
          fields,
        };
      }

      stepData = fields;
      nextPage = "final";
      break;
    }
    case "final": {
      const linuxSkillLevel = formData.get("linuxSkillLevel") as string;
      const potentialInvolvement = formData.getAll(
        "potentialInvolvement",
      ) as string[];
      const discordUsername = formData.get("discordUsername") as string;
      const fields = { linuxSkillLevel, potentialInvolvement, discordUsername };

      if (
        !linuxSkillLevel ||
        !VALID_SKILL_LEVELS.includes(linuxSkillLevel as LinuxSkillLevel)
      ) {
        return {
          error: "Please select a valid Linux knowledge level.",
          fields,
        };
      }

      if (potentialInvolvement.length == 0) {
        return { error: "Please select at least 1 involvement.", fields };
      }

      if (
        !potentialInvolvement.every((i) =>
          VALID_INVOLVEMENTS.includes(i as PotentialInvolvement),
        )
      ) {
        return { error: "Invalid involvement option selected.", fields };
      }

      if (exceedsMax(discordUsername, "discordUsername")) {
        return {
          error: `Discord username must be under ${MAX_LENGTHS.discordUsername} characters.`,
          fields,
        };
      }

      // Merge final step data with full draft
      const fullDraft: Partial<RegistrationDraft> = {
        ...stripIrrelevantFields(prev),
        linuxSkillLevel,
        potentialInvolvement,
        discordUsername,
      };

      console.log(fullDraft);

      // Final submission logic
      const submission = await submitMemberRegistration(
        toParsedSubmission(fullDraft),
      );

      if (!submission.ok) {
        return { error: submission.error.message, fields };
      }

      cookieStore.delete({ name: "formState", path: "/registration" });
      redirect("/registration/success");
      break;
    }
    default:
      nextPage = "start";
      break;
  }

  // Merge
  const newDraft: Partial<RegistrationDraft> = {
    ...prev,
    ...stepData,
    pageStack: [...(prev.pageStack ?? []), page],
    page: nextPage,
  };

  // Save data to cookie
  cookieStore.set("formState", JSON.stringify(newDraft), COOKIE_OPTIONS);

  // Redirect to the next step
  redirect("/registration");
}
