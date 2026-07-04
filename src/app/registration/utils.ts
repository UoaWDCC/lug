import { RegistrationDraft, RegistrationPage } from "./types";

export const VALID_PAGES: RegistrationPage[] = [
  "start",
  "returningUoa",
  "newMember",
  "newUoa",
  "newNonUoa",
  "final",
];

const DEFAULT: Partial<RegistrationDraft> = {
  page: "start",
  pageStack: [],
};

export function readRegistrationDraft(
  raw: string | undefined,
): Partial<RegistrationDraft> {
  try {
    if (!raw) return DEFAULT;

    const parsed = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) return DEFAULT;

    // Validate page
    if (parsed.page && !VALID_PAGES.includes(parsed.page)) return DEFAULT;

    // Validate pageStack
    if (parsed.pageStack !== undefined) {
      if (!Array.isArray(parsed.pageStack)) return DEFAULT;
      if (
        parsed.pageStack.some(
          (p: unknown) => !VALID_PAGES.includes(p as RegistrationPage),
        )
      )
        return DEFAULT;
    }

    return parsed;
  } catch {
    return DEFAULT;
  }
}
