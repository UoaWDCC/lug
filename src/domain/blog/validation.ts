import { z } from "zod";
import { BlogTag } from "@/generated/prisma/client";

export const blogPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),

  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),

  excerpt: z
    .string()
    .trim()
    .max(500, "Excerpt must be 500 characters or less")
    .optional(),

  content: z.string().trim().min(1, "Content is required"),

  tags: z.array(z.enum(BlogTag)),

  publishedAt: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return value;
  }, z.coerce.date().optional()),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
