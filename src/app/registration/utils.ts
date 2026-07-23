import { RegistrationDraft, RegistrationPage } from "./types";

export const VALID_PAGES: RegistrationPage[] = [
  "start",
  "returningUoa",
  "newMember",
  "newUoa",
  "newNonUoa",
  "final",
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

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return freshDefault();

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
