import { BlogTag } from "@/generated/prisma/client";

export function parseBlogTag(value: string): BlogTag | null {
  const normalized = value.toUpperCase();

  return Object.values(BlogTag).includes(normalized as BlogTag)
    ? (normalized as BlogTag)
    : null;
}

export function formatBlogTag(tag: BlogTag): string {
  return tag
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function blogTagPath(tag: BlogTag): string {
  return `/blog/tag/${tag.toLowerCase()}`;
}
