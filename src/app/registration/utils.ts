import { RegistrationDraft, RegistrationPage } from "./types";

export const VALID_PAGES: RegistrationPage[] = [
  "start",
  "returningUoa",
  "newMember",
  "newUoa",
  "newNonUoa",
  "final",
];

export const VALID_SKILL_LEVELS = [
  "NOTHING",
  "AWARE_OF_EXISTENCE",
  "BEGINNER_USER",
  "REGULAR_USER",
  "POWER_USER",
  "CONTRIBUTOR",
];

export const VALID_INVOLVEMENTS = [
  "ATTENDING",
  "SPEAKING",
  "EXECUTIVE",
  "PROJECTS",
];

function freshDefault(): Partial<RegistrationDraft> {
  return { page: "start", pageStack: [] };
}

export function readRegistrationDraft(
  raw: string | undefined,
): Partial<RegistrationDraft> {
  try {
    if (!raw) return freshDefault();

    const parsed = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) return freshDefault();

    // Validate page
    if (parsed.page && !VALID_PAGES.includes(parsed.page))
      return freshDefault();

    // Validate pageStack
    if (parsed.pageStack !== undefined) {
      if (!Array.isArray(parsed.pageStack)) return freshDefault();
      if (
        parsed.pageStack.some(
          (p: unknown) => !VALID_PAGES.includes(p as RegistrationPage),
        )
      )
        return freshDefault();
    }

    return parsed;
  } catch {
    return freshDefault();
  }
}
