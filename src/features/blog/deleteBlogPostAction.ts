"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { deleteBlogPost } from "@/repositories/blogPostRepository";

export async function deleteBlogPostAction(id: string): Promise<void> {
  await requireAdmin();
  if (!id) redirect("/admin/blog?error=not_found");

  const result = await deleteBlogPost(id);
  if (!result.ok) {
    redirect(`/admin/blog?error=${result.error.type}`);
  }

  redirect("/admin/blog");
}
