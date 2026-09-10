import type { BlogItem } from "@/domain/blog/types";

/* Empty until real posts exist; the blog page renders its empty state off this. */
export async function getMockBlogItems(): Promise<BlogItem[]> {
  return [];
}
