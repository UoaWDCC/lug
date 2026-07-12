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

export const MAX_LENGTHS = {
  email: 254,
  firstName: 100,
  lastName: 100,
  otherFaculty: 100,
  programme: 150,
  primaryAffiliation: 150,
  nonUoaExcerpt: 500,
  nonUoaPitch: 500,
  discordUsername: 32,
} as const;

/**
 * Checks whether a submitted field value exceeds its configured max length.
 *
 * Only answers the "too long" question — an empty or undefined value is
 * never considered too long, so required-ness must still be checked
 * separately (e.g. `if (!email) { ... }`). Keeping presence and length as
 * two independent checks makes each call site easier to read, and means
 * this function never needs to know a field's error message for being
 * missing versus being long.
 *
 * @param value - Raw field value pulled from FormData (or undefined if the
 *   field wasn't submitted at all).
 * @param key - Must be one of MAX_LENGTHS's own keys. Restricting this to
 *   `keyof typeof MAX_LENGTHS` instead of plain `string` turns a typo'd or
 *   unregistered field name into a compile-time TypeScript error, rather
 *   than a runtime `undefined` comparison that would always evaluate to
 *   `false` and silently let oversized input through.
 * @returns true only when `value` is present AND longer than its limit.
 */
export function exceedsMax(
  value: string | undefined,
  key: keyof typeof MAX_LENGTHS,
) {
  return !!value && value.length > MAX_LENGTHS[key];
}

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
