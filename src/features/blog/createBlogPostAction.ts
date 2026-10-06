"use server";

import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { blogPostSchema } from "@/domain/blog/validation";
import { slugify } from "@/domain/blog/slugify";
import { requireAdmin } from "@/lib/auth/session";
import { findAdminById } from "@/repositories/adminRepository";
import { createBlogPost } from "@/repositories/blogPostRepository";

export type CreateBlogPostActionError = {
  ok: false;
  error: "admin_not_found" | "validation" | "duplicate" | "database";
};

export async function createBlogPostAction(
  formData: FormData,
): Promise<CreateBlogPostActionError> {
  const session = await requireAdmin();
  const admin = await findAdminById(session.adminId);
  if (!admin) return { ok: false, error: "admin_not_found" };

  const title = readText(formData, "title");
  const input = {
    title,
    slug: readText(formData, "slug") || slugify(title),
    excerpt: readText(formData, "excerpt") || undefined,
    content: readText(formData, "content"),
    tags: formData.getAll("tags"),
    publishedAt: readText(formData, "publishedAt") || undefined,
  };
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "validation" };

  const publishedAt = parsed.data.publishedAt ?? null;
  const status = !publishedAt
    ? "DRAFT"
    : publishedAt > new Date()
      ? "SCHEDULED"
      : "PUBLISHED";

  const post: Prisma.BlogPostCreateInput = {
    ...parsed.data,
    publishedAt,
    status,
    authorName: `${admin.firstName} ${admin.lastName}`,
  };

  const result = await createBlogPost(post);
  if (!result.ok) {
    return {
      ok: false,
      error: result.error.type === "duplicate" ? "duplicate" : "database",
    };
  }

  redirect("/admin/blog");
}

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}
