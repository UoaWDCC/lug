"use server";

import {
  RegistrationPage,
  RegistrationDraft,
  RegistrationFormState,
} from "./types";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { VALID_PAGES, readRegistrationDraft } from "./utils";

import {
  VALID_INVOLVEMENTS,
  VALID_SKILL_LEVELS,
  VALID_YEAR_LEVELS,
  MAX_LENGTHS,
  MAX_FACULTIES,
  MAX_MAJORS,
} from "@/domain/member/constants";

import { exceedsMax } from "@/domain/member/exceedsMax";
import {
  LinuxSkillLevel,
  PotentialInvolvement,
  YearLevel,
} from "@/domain/member/types";

import { submitMemberRegistration } from "@/features/membership-registration/submitMemberRegistration";
import { ParsedRegistrationFormSubmission } from "@/features/membership-registration/parseRegistrationFormData";

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

  if (lastPage == "returningUoa") {
    const {
      firstName,
      lastName,
      isCurrentUoaStudent,
      faculty,
      programme,
      yearLevel,
      primaryAffiliation,
      nonUoaExcerpt,
      nonUoaPitch,
      ...stripped
    } = draftFields;
    return stripped;
  } else if (lastPage == "newUoa") {
    const { primaryAffiliation, nonUoaExcerpt, nonUoaPitch, ...stripped } =
      draftFields;
    return stripped;
  } else {
    const { upi, studentId, faculty, programme, yearLevel, ...stripped } =
      draftFields;
    return stripped;
  }
}

function toParsedSubmission(
  draft: Partial<RegistrationDraft>,
): ParsedRegistrationFormSubmission {
  return {
    firstName: draft.firstName ?? null,
    lastName: draft.lastName ?? null,
    email: draft.email ?? null,
    isConditionalReturningMember: draft.isConditionalReturningMember ?? null,
    isCurrentUoaStudent: draft.isCurrentUoaStudent ?? null,
    upi: draft.upi ?? null,
    studentId: draft.studentId ?? null,
    faculty: draft.faculty ?? [],
    majors: draft.majors ?? [],
    programme: draft.programme ?? null,
    yearLevel: draft.yearLevel ?? null,
    primaryAffiliation: draft.primaryAffiliation ?? null,
    nonUoaExcerpt: draft.nonUoaExcerpt ?? null,
    nonUoaPitch: draft.nonUoaPitch ?? null,
    linuxSkillLevel: draft.linuxSkillLevel ?? null,
    potentialInvolvement: draft.potentialInvolvement ?? [],
    discordUsername: draft.discordUsername ?? null,
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
      const email = formData.get("email") as string;
      const isConditionalReturningMember = formData.get(
        "isConditionalReturningMember",
      ) as string;
      const fields = { email, isConditionalReturningMember };

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return {
          error: "Please enter a valid email address (e.g., name@example.com).",
          fields: { email, isConditionalReturningMember },
        };
      }

      if (exceedsMax(email, "email")) {
        return {
          error: `Your email must be under ${MAX_LENGTHS.email} characters.`,
          fields: { email, isConditionalReturningMember },
        };
      }

      if (
        isConditionalReturningMember !== "yes" &&
        isConditionalReturningMember !== "no"
      ) {
        return {
          error: "Please select whether you have registered previously.",
          fields: { email },
        };
      }

      stepData = fields;
      nextPage =
        isConditionalReturningMember === "yes" ? "returningUoa" : "newMember";
      break;
    }
    case "newMember": {
      const firstName = formData.get("firstName") as string;
      const lastName = formData.get("lastName") as string;
      const isCurrentUoaStudent = formData.get("isCurrentUoaStudent") as string;
      const fields = { firstName, lastName, isCurrentUoaStudent };

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

      if (isCurrentUoaStudent !== "yes" && isCurrentUoaStudent !== "no") {
        return {
          error:
            "Please select whether you attend the University of Auckland (UoA).",
          fields,
        };
      }

      stepData = fields;
      nextPage = isCurrentUoaStudent === "yes" ? "newUoa" : "newNonUoa";
      break;
    }
    case "newUoa": {
      const upiRegex = /^[a-z]{3,4}\d{3}$/i;
      const studentIdRegex = /^\d{9,10}$/;

      const upi = formData.get("upi") as string;
      const studentId = formData.get("studentId") as string;
      const faculty = formData.getAll("faculty") as string[];
      const majors = (formData.getAll("majors") as string[])
        .map((major) => major.trim())
        .filter((major) => major !== "");
      const majorCount = Math.min(
        Number(formData.get("majorCount")) || prev.majorCount || 1,
        MAX_MAJORS,
      );
      const programme = formData.get("programme") as string;
      const yearLevel = formData.get("yearLevel") as string;
      const fields = {
        upi,
        studentId,
        faculty,
        majors,
        majorCount,
        programme,
        yearLevel,
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

      if (faculty.length == 0) {
        return { error: "Please select at least 1 faculty.", fields };
      }

      if (faculty.length > MAX_FACULTIES) {
        return {
          error: `Please select at most ${MAX_FACULTIES} faculties.`,
          fields,
        };
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

      if (!programme) {
        return {
          error: "Please enter your current programme of study.",
          fields,
        };
      }

      if (exceedsMax(programme, "programme")) {
        return {
          error: `Programme must be under ${MAX_LENGTHS.programme} characters.`,
          fields,
        };
      }

      if (!yearLevel) {
        return { error: "Please select your current year of study.", fields };
      }

      if (!VALID_YEAR_LEVELS.includes(yearLevel as YearLevel)) {
        return { error: "Please select a valid year of study.", fields };
      }

      stepData = fields;
      nextPage = "final";
      break;
    }
    case "newNonUoa": {
      const primaryAffiliation = formData.get("primaryAffiliation") as string;
      const nonUoaExcerpt = formData.get("nonUoaExcerpt") as string;
      const nonUoaPitch = formData.get("nonUoaPitch") as string;
      const fields = { primaryAffiliation, nonUoaExcerpt, nonUoaPitch };

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
    case "returningUoa": {
      const upiRegex = /^[a-z]{3,4}\d{3}$/i;
      const studentIdRegex = /^\d{9,10}$/;

      const upi = formData.get("upi") as string;
      const studentId = formData.get("studentId") as string;
      const fields = { upi, studentId };

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

      if (
        potentialInvolvement.length > 0 &&
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
