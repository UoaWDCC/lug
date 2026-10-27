import { describe, it, expect } from "vitest";
import { composeEmailSchema } from "../validation";
import { MAX_LENGTHS } from "../constants";

const ready = {
  audience: "all",
  subject: "Install party",
  body: "Bring your laptop!",
};

describe("composeEmailSchema", () => {
  it("maps the form's audience value to the database value", () => {
    const result = composeEmailSchema.safeParse({
      ...ready,
      intent: "send",
      audience: "uoa",
    });
    expect(result.success && result.data.audience).toBe("UOA_STUDENTS");
  });

  it("rejects an unknown audience", () => {
    const result = composeEmailSchema.safeParse({
      ...ready,
      intent: "send",
      audience: "everyone",
    });
    expect(result.success).toBe(false);
  });

  it("rejects scheduling, which isn't supported yet", () => {
    const result = composeEmailSchema.safeParse({
      ...ready,
      intent: "schedule",
      scheduledAt: "2026-11-03T18:30",
    });
    expect(result.success).toBe(false);
  });

  it("lets a draft have an empty subject and body", () => {
    const result = composeEmailSchema.safeParse({
      intent: "draft",
      audience: "all",
      subject: "",
      body: "",
    });
    expect(result.success).toBe(true);
  });

  it("requires a subject and body to send", () => {
    const result = composeEmailSchema.safeParse({
      intent: "send",
      audience: "all",
      subject: "   ",
      body: "",
    });
    expect(result.success).toBe(false);
  });

  it("trims the subject", () => {
    const result = composeEmailSchema.safeParse({
      ...ready,
      intent: "send",
      subject: "  Install party  ",
    });
    expect(result.success && result.data.subject).toBe("Install party");
  });

  it("rejects a subject over the limit, even in a draft", () => {
    const result = composeEmailSchema.safeParse({
      ...ready,
      intent: "draft",
      subject: "a".repeat(MAX_LENGTHS.subject + 1),
    });
    expect(result.success).toBe(false);
  });
});
