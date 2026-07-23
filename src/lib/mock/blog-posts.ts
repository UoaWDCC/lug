import type { BlogItem } from "@/domain/blog/types";

export async function getMockBlogItems(): Promise<BlogItem[]> {
  return [
    {
      title: "Example Blog Item",
      slug: "example-blog-item",
      description: "This is an example blog item.",
      publishedAt: "2026-04-30",
    },
    {
      title: "Another Update",
      slug: "another-update",
      description: "This is another update.",
      publishedAt: "2026-04-28",
    },
  ];
}
