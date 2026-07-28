"use server";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/session";
import { deleteMember } from "@/repositories/memberRepository";

export type DeleteMemberActionResult = {
  ok: false;
  error: "invalid_id" | "not_found" | "database";
};

export default async function deleteMemberAction(
  id: number,
): Promise<DeleteMemberActionResult> {
  await requireAdmin();

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: "invalid_id" };
  }

  const result = await deleteMember(id);

  if (!result.ok) {
    return { ok: false, error: result.error.type };
  }

  redirect("/admin/members");
}
