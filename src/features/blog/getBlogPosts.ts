import { getMockBlogItems } from "@/lib/mock/blog-posts";
import type { BlogItem } from "@/domain/blog/types";
export default async function getBlogPosts(): Promise<BlogItem[]> {
  return await getMockBlogItems();
}
