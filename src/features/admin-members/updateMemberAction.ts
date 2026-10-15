"use server";

import { redirect } from "next/navigation";
import { UpdateMemberSchema } from "@/domain/member/validation";
import { requireAdmin } from "@/lib/auth/session";
import { updateMember } from "@/repositories/memberRepository";

export type UpdateMemberActionResult = {
  ok: false;
  error: "invalid_id" | "invalid_data" | "not_found" | "duplicate" | "database";
  message: string;
};

export default async function updateMemberAction(
  formData: FormData,
): Promise<UpdateMemberActionResult> {
  // Server Actions can be called independently of the page, so authenticate
  // here even though the edit page also calls requireAdmin().
  await requireAdmin();

  // The ID comes from a hidden field rather than user input, so it is checked
  // separately from the member details.
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false,
      error: "invalid_id",
      message: "The member ID is invalid.",
    };
  }

  const parsed = UpdateMemberSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    discordUsername: formData.get("discordUsername"),
    faculty: formData.getAll("faculty"),
    programmeType: formData.get("programmeType"),
    majors: formData.getAll("majors"),
    yearsRemaining: formData.get("yearsRemaining"),
    linuxSkillLevel: formData.get("linuxSkillLevel"),
    potentialInvolvement: formData.getAll("potentialInvolvement"),
    primaryAffiliation: formData.get("primaryAffiliation"),
    nonUoaExcerpt: formData.get("nonUoaExcerpt"),
    nonUoaPitch: formData.get("nonUoaPitch"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_data",
      message: parsed.error.issues[0].message,
    };
  }

  const result = await updateMember(id, parsed.data);
  if (!result.ok) {
    return repositoryError(result.error.type);
  }

  redirect("/admin/members");
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
