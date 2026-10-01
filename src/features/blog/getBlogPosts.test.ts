import { describe, expect, it } from "vitest";
import getBlogPosts from "./getBlogPosts";

describe("getBlogPosts", () => {
  it("returns no posts until real ones exist", async () => {
    await expect(getBlogPosts()).resolves.toEqual([]);
  });
});
