import { describe, expect, it } from "vitest";

import { BlogTag } from "@/generated/prisma/client";

import { blogTagPath, formatBlogTag, parseBlogTag } from "./tags";

describe("blog tags", () => {
  it("parses case-insensitive route segments", () => {
    expect(parseBlogTag("tutorials")).toBe(BlogTag.TUTORIALS);
    expect(parseBlogTag("EVENTS")).toBe(BlogTag.EVENTS);
  });

  it("rejects invalid route segments", () => {
    expect(parseBlogTag("not-a-tag")).toBeNull();
  });

  it("formats tag labels and canonical paths", () => {
    expect(formatBlogTag(BlogTag.ANNOUNCEMENTS)).toBe("Announcements");
    expect(blogTagPath(BlogTag.ANNOUNCEMENTS)).toBe("/blog/tag/announcements");
  });
});
