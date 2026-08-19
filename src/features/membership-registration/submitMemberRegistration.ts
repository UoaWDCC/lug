import { UnvalidatedMemberSubmission } from "@/domain/member/types";
import { validateMemberRegistration } from "@/domain/member/validation";
import { createMembershipRegistration } from "@/repositories/memberRepository";

export type SubmitMemberRegistrationResult =
  | { ok: true }
  | { ok: false; error: { message: string } };

export async function submitMemberRegistration(
  submission: UnvalidatedMemberSubmission,
): Promise<SubmitMemberRegistrationResult> {
  const validation = validateMemberRegistration(submission);
  if (!validation.ok) {
    return { ok: false, error: { message: validation.error.message } };
  }

  const creation = await createMembershipRegistration(validation.data);
  if (!creation.ok) {
    if (creation.error.type === "duplicate") {
      return {
        ok: false,
        error: {
          message:
            "It looks like you've already registered. If you believe this is a mistake, please contact lug.aucklanduni@gmail.com.",
        },
      };
    }
    return {
      ok: false,
      error: {
        message:
          "Something went wrong saving your registration. Please try again, or contact lug.aucklanduni@gmail.com if the problem continues.",
      },
    };
  }

  return { ok: true };
}
