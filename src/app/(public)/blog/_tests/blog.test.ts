import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import type { BlogPost } from "@/generated/prisma/client";
import {
  formatPostDate,
  normaliseTag,
  postCountLabel,
  readingTime,
} from "@/features/blog/publicPosts";

const mockFindPublishedBlogPosts = vi.hoisted(() => vi.fn());
const mockFindPublishedBlogPostBySlug = vi.hoisted(() => vi.fn());

vi.mock("@/repositories/blogPostRepository", () => ({
  findPublishedBlogPosts: mockFindPublishedBlogPosts,
  findPublishedBlogPostBySlug: mockFindPublishedBlogPostBySlug,
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const post = (overrides: Partial<BlogPost>): BlogPost => ({
  id: "1",
  title: "A post",
  slug: "a-post",
  excerpt: "An excerpt",
  content: "Hello **world**",
  status: "PUBLISHED",
  publishedAt: new Date("2026-09-02T00:00:00Z"),
  tags: ["EVENTS"],
  imageUrl: null,
  authorName: "Carl Dela Pena",
  createdAt: new Date("2026-09-01T00:00:00Z"),
  updatedAt: new Date("2026-09-01T00:00:00Z"),
  ...overrides,
});

async function renderIndex(tag?: string) {
  const { default: Blog } = await import("../page");
  return renderToStaticMarkup(
    await Blog({ searchParams: Promise.resolve({ tag }) }),
  );
}

async function renderPost(slug: string) {
  const { default: BlogPostPage } = await import("../[slug]/page");
  return renderToStaticMarkup(
    await BlogPostPage({ params: Promise.resolve({ slug }) }),
  );
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("placeholder posts", () => {
  it("lists placeholder posts by default without touching the database", async () => {
    const html = await renderIndex();

    expect(html).toContain("placeholder posts");
    expect(html).toContain("10 posts");
    expect(mockFindPublishedBlogPosts).not.toHaveBeenCalled();
  });

  it("opens a placeholder post by slug", async () => {
    const html = await renderPost("samirs-broken-branch");

    expect(html).toContain("Samir&#x27;s broken branch");
    expect(html).toContain("placeholder post");
  });
});

describe("database posts", () => {
  beforeEach(() => {
    vi.stubEnv("BLOG_SOURCE", "database");
  });

  it("shows a fallback when the database is unreachable", async () => {
    mockFindPublishedBlogPosts.mockRejectedValue(
      new Error("Can't reach database server"),
    );

    expect(await renderIndex()).toContain("Could not load posts.");
  });

  it("renders the empty state when there are no posts", async () => {
    mockFindPublishedBlogPosts.mockResolvedValue([]);

    const html = await renderIndex();
    expect(html).toContain("No blogs yet.");
    expect(html).not.toContain("placeholder posts");
  });

  it("lists posts with their meta line", async () => {
    mockFindPublishedBlogPosts.mockResolvedValue([post({})]);

    const html = await renderIndex();
    expect(html).toContain('href="/blog/a-post"');
    expect(html).toContain("2 Sep 2026 | Carl Dela Pena | 1 min");
  });

  it("filters by a known tag and ignores unknown ones", async () => {
    mockFindPublishedBlogPosts.mockResolvedValue([
      post({ slug: "event", tags: ["EVENTS"] }),
      post({ slug: "news", tags: ["ANNOUNCEMENTS"] }),
    ]);

    const filtered = await renderIndex("events");
    expect(filtered).toContain("1 post | #events");
    expect(filtered).not.toContain("/blog/news");

    expect(await renderIndex("nope")).toContain("2 posts");
  });

  it("renders the post body as markdown with its tags", async () => {
    mockFindPublishedBlogPostBySlug.mockResolvedValue(post({}));

    const html = await renderPost("a-post");
    expect(html).toContain("<strong>world</strong>");
    expect(html).toContain("a-post.md");
    expect(html).toContain('href="/blog?tag=events"');
  });

  it("is not found when the slug has no published post", async () => {
    mockFindPublishedBlogPostBySlug.mockResolvedValue(null);

    await expect(renderPost("missing")).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

describe("display helpers", () => {
  it("estimates read time at about 200 words a minute, never under one", () => {
    expect(readingTime("word ".repeat(600))).toBe("3 min");
    expect(readingTime("")).toBe("1 min");
  });

  it("formats dates in UTC as day, short month, year", () => {
    expect(formatPostDate(new Date("2026-09-02T23:30:00Z"))).toBe("2 Sep 2026");
  });

  it.each([
    [0, null, "0 posts"],
    [1, null, "1 post"],
    [2, "events", "2 posts | #events"],
  ])("counts %i with tag %s as %s", (count, tag, label) => {
    expect(postCountLabel(count, tag)).toBe(label);
  });

  it("accepts known tags in any case and rejects the rest", () => {
    expect(normaliseTag("#Events", ["events"])).toBe("events");
    expect(normaliseTag("meetings", ["events"])).toBeNull();
    expect(normaliseTag(undefined, ["events"])).toBeNull();
  });
});
