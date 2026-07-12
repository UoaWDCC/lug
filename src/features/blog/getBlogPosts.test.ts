import { describe, expect, it } from "vitest";
import getBlogPosts from "./getBlogPosts";

describe("getBlogPosts", () => {
  it("returns blog posts", async () => {
    const posts = await getBlogPosts();

    expect(posts).toHaveLength(2);

    expect(posts[0]).toEqual({
      title: "Example Blog Item",
      slug: "example-blog-item",
      description: "This is an example blog item.",
      publishedAt: "2026-04-30",
    });
  });
});
