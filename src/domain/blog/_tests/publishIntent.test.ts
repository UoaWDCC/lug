import { describe, it, expect } from "vitest";
import { applyPublishIntent } from "../publishIntent";

const now = new Date("2026-10-17T00:00:00.000Z");

function form(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return formData;
}

describe("applyPublishIntent", () => {
  it("clears the publish date when saving a draft", () => {
    const formData = form({
      intent: "draft",
      publishedAt: "2026-12-01T00:00:00.000Z",
    });
    applyPublishIntent(formData, now);
    expect(formData.get("publishedAt")).toBe("");
  });

  it("publishes now when publishing without a date", () => {
    const formData = form({ intent: "publish", publishedAt: "" });
    applyPublishIntent(formData, now);
    expect(formData.get("publishedAt")).toBe(now.toISOString());
  });

  it("publishes now when the date field is missing entirely", () => {
    const formData = form({ intent: "publish" });
    applyPublishIntent(formData, now);
    expect(formData.get("publishedAt")).toBe(now.toISOString());
  });

  it("keeps a chosen date when publishing, so future dates schedule the post", () => {
    const formData = form({
      intent: "publish",
      publishedAt: "2026-12-01T00:00:00.000Z",
    });
    applyPublishIntent(formData, now);
    expect(formData.get("publishedAt")).toBe("2026-12-01T00:00:00.000Z");
  });

  it("leaves the form unchanged when there is no intent", () => {
    const formData = form({ publishedAt: "2026-12-01T00:00:00.000Z" });
    applyPublishIntent(formData, now);
    expect(formData.get("publishedAt")).toBe("2026-12-01T00:00:00.000Z");
  });
});
