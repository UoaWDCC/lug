import {
  UnvalidatedMemberSubmission,
  BaseMemberRegistration,
  CurrentUoaStudentMember,
  LinuxSkillLevel,
  MemberRegistration,
  NonCurrentUoaStudentMember,
  PotentialInvolvement,
  ProgrammeType,
} from "./types";
import {
  MAX_LENGTHS,
  VALID_INVOLVEMENTS,
  VALID_SKILL_LEVELS,
} from "./constants";
import { exceedsMax } from "./exceedsMax";

type RegistrationFormValidationError = {
  message: string;
};

// TODO #92: Rewrite this entire file using Zod schemas.
// The external contract must stay the same:
//   Input:  UnvalidatedMemberSubmission (loose, all fields string | null)
//   Output: { ok: true, data: MemberRegistration } | { ok: false, error: { message: string } }
// The discriminant is isCurrentUoaStudent ("yes" / "no"), not isConditionalReturningMember (removed).
// See ticket #92 for the full Zod sketch and requirements.

export function validateMemberRegistration(
  submission: UnvalidatedMemberSubmission,
):
  | { ok: true; data: MemberRegistration }
  | { ok: false; error: RegistrationFormValidationError } {
  // TEMP: stubbed to always fail until #92 rewrites with Zod
  return {
    ok: false,
    error: { message: "Validation not yet implemented — pending #92 rewrite" },
  };
}
