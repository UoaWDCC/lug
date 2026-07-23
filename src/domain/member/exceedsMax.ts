import { MAX_LENGTHS } from "./constants";

/**
 * Checks whether a submitted field value exceeds its configured max length.
 *
 * Only answers the "too long" question — an empty, null, or undefined
 * value is never considered too long, so required-ness must still be
 * checked separately (e.g. `if (!email) { ... }`).
 *
 * @param value - Raw field value. Accepts `string | null | undefined`
 *   since callers pass FormData-derived strings (`string | undefined`,
 *   from src/app/registration/actions.ts) and parsed-form values
 *   (`string | null`, from ParsedRegistrationFormSubmission).
 * @param key - Must be one of MAX_LENGTHS's own keys, so a typo'd or
 *   unregistered field name is a compile-time error, not a silent
 *   runtime `undefined` comparison.
 * @returns true only when `value` is present AND longer than its limit.
 */
export function exceedsMax(
  value: string | null | undefined,
  key: keyof typeof MAX_LENGTHS,
): boolean {
  return !!value && value.length > MAX_LENGTHS[key];
}
