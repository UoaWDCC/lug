// src/app/(public)/blog/_tests/blog.test.ts
import { describe, it, expect, vi } from "vitest";

const mockFindPublishedBlogPosts = vi.hoisted(() => vi.fn());

vi.mock("@/repositories/blogPostRepository", () => ({
  findPublishedBlogPosts: mockFindPublishedBlogPosts,
}));

describe("Blog page", () => {
  it("does not throw when the database is unreachable", async () => {
    mockFindPublishedBlogPosts.mockRejectedValue(
      new Error("Can't reach database server"),
    );

    const { default: Blog } = await import("../page");
    await expect(Blog()).resolves.toBeDefined();
  });

  it("renders when there are no posts", async () => {
    mockFindPublishedBlogPosts.mockResolvedValue([]);

    const { default: Blog } = await import("../page");
    await expect(Blog()).resolves.toBeDefined();
  });
});
