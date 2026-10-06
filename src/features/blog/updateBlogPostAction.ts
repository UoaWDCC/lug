"use server";

import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { blogPostSchema } from "@/domain/blog/validation";
import { slugify } from "@/domain/blog/slugify";
import { requireAdmin } from "@/lib/auth/session";
import { updateBlogPost } from "@/repositories/blogPostRepository";

export type UpdateBlogPostActionError = {
  ok: false;
  error: "invalid_id" | "validation" | "not_found" | "duplicate" | "database";
};

export async function updateBlogPostAction(
  formData: FormData,
): Promise<UpdateBlogPostActionError> {
  await requireAdmin();

  const id = readText(formData, "id");
  if (!id) return { ok: false, error: "invalid_id" };

  const title = readText(formData, "title");
  const parsed = blogPostSchema.safeParse({
    title,
    slug: readText(formData, "slug") || slugify(title),
    excerpt: readText(formData, "excerpt") || undefined,
    content: readText(formData, "content"),
    tags: formData.getAll("tags"),
    publishedAt: readText(formData, "publishedAt") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "validation" };

  const publishedAt = parsed.data.publishedAt ?? null;
  const status = !publishedAt
    ? "DRAFT"
    : publishedAt > new Date()
      ? "SCHEDULED"
      : "PUBLISHED";

  const data: Prisma.BlogPostUpdateInput = {
    ...parsed.data,
    excerpt: parsed.data.excerpt ?? null,
    publishedAt,
    status,
  };
  const result = await updateBlogPost(id, data);
  if (!result.ok) {
    return { ok: false, error: result.error.type };
  }

  redirect("/admin/blog");
}

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}
