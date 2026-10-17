import { beforeEach, describe, expect, it, vi } from "vitest";

import { BlogTag } from "@/generated/prisma/client";

const mockFindFirst = vi.hoisted(() => vi.fn());
const mockFindMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/prisma", () => ({
  getPrisma: () => ({
    blogPost: {
      findFirst: mockFindFirst,
      findMany: mockFindMany,
    },
  }),
}));

import {
  findPublishedBlogPostBySlug,
  findPublishedBlogPosts,
  findPublishedBlogPostsByTag,
} from "../blogPostRepository";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("published blog post queries", () => {
  it("lists published, non-future posts newest first", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    await findPublishedBlogPosts();

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: expect.any(Date) },
      },
      orderBy: { publishedAt: "desc" },
    });
  });

  it("finds a published, non-future post by slug", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const result = await findPublishedBlogPostBySlug("hello-linux");

    expect(result).toBeNull();
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        slug: "hello-linux",
        status: "PUBLISHED",
        publishedAt: { lte: expect.any(Date) },
      },
    });
  });

  it("filters published, non-future posts by tag newest first", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    await findPublishedBlogPostsByTag(BlogTag.TUTORIALS);

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: expect.any(Date) },
        tags: { has: BlogTag.TUTORIALS },
      },
      orderBy: { publishedAt: "desc" },
    });
  });
});
