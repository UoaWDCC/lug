import { describe, it, expect, vi, afterEach } from "vitest";

const mockCreate = vi.hoisted(() => vi.fn());
const mockUpdateMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/prisma", () => ({
  getPrisma: () => ({
    email: { create: mockCreate, updateMany: mockUpdateMany },
  }),
}));

import { claimEmailForSending, createEmail } from "../emailRepository";

afterEach(() => {
  vi.clearAllMocks();
});

describe("createEmail", () => {
  it("returns the created email", async () => {
    const email = { id: "email_1", subject: "Hello" };
    mockCreate.mockResolvedValueOnce(email);

    const result = await createEmail({
      subject: "Hello",
      body: "Hi all",
      audience: "ALL",
      authorName: "Amy Chen",
    });

    expect(result).toEqual({ ok: true, data: email });
  });

  it("returns a database error when the query fails", async () => {
    mockCreate.mockRejectedValueOnce(new Error("connection refused"));

    const result = await createEmail({
      subject: "Hello",
      body: "Hi all",
      audience: "ALL",
      authorName: "Amy Chen",
    });

    expect(result).toEqual({ ok: false, error: { type: "database" } });
  });
});

describe("claimEmailForSending", () => {
  it("only moves the email to SENDING if it is still a draft", async () => {
    mockUpdateMany.mockResolvedValueOnce({ count: 1 });

    await claimEmailForSending("email_1");

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: "email_1", status: "DRAFT" },
      data: { status: "SENDING" },
    });
  });

  it("returns true when the draft was claimed", async () => {
    mockUpdateMany.mockResolvedValueOnce({ count: 1 });

    const result = await claimEmailForSending("email_1");

    expect(result).toEqual({ ok: true, data: true });
  });

  it("returns false when the email was not a draft", async () => {
    mockUpdateMany.mockResolvedValueOnce({ count: 0 });

    const result = await claimEmailForSending("email_1");

    expect(result).toEqual({ ok: true, data: false });
  });
});
