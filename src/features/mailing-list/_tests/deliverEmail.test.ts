import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Email } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
  findAudienceMembers: vi.fn(),
  findAllOptedOutEmailAddresses: vi.fn(),
  claimEmailForSending: vi.fn(),
  updateEmail: vi.fn(),
  sendEmail: vi.fn(),
  buildUnsubscribeLinks: vi.fn(),
}));

vi.mock("@/repositories/memberRepository", () => ({
  findAudienceMembers: mocks.findAudienceMembers,
}));
vi.mock("@/repositories/emailAddressOptOutRepository", () => ({
  findAllOptedOutEmailAddresses: mocks.findAllOptedOutEmailAddresses,
}));
vi.mock("@/repositories/emailRepository", () => ({
  claimEmailForSending: mocks.claimEmailForSending,
  updateEmail: mocks.updateEmail,
}));
vi.mock("@/lib/email/sendEmail", () => ({ sendEmail: mocks.sendEmail }));
vi.mock("@/lib/email/unsubscribe", () => ({
  buildUnsubscribeLinks: mocks.buildUnsubscribeLinks,
}));

import { deliverEmail } from "../deliverEmail";

const member = (email: string) => ({
  email,
  isCurrentUoaStudent: true,
  upi: null,
  studentId: null,
});

const email = {
  id: "email-1",
  subject: "Welcome back",
  body: "Hello **everyone**",
  audience: "ALL",
  status: "DRAFT",
} as Email;

beforeEach(() => {
  mocks.findAudienceMembers.mockResolvedValue({
    currentMembers: [member("amy@example.com"), member("ben@example.com")],
    earlierMembers: [],
  });
  mocks.findAllOptedOutEmailAddresses.mockResolvedValue([]);
  mocks.claimEmailForSending.mockResolvedValue({ ok: true, data: true });
  mocks.updateEmail.mockResolvedValue({ ok: true, data: email });
  mocks.sendEmail.mockResolvedValue(undefined);
  mocks.buildUnsubscribeLinks.mockImplementation(async (to: string) => ({
    pageUrl: `https://lug.example/unsubscribe?token=${to}`,
    headers: { "List-Unsubscribe": `<https://lug.example/api/${to}>` },
  }));
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("deliverEmail", () => {
  it("sends one message per recipient with their own unsubscribe link, then marks it SENT", async () => {
    const result = await deliverEmail(email);

    expect(result).toEqual({ status: "sent", delivered: 2 });
    expect(mocks.sendEmail).toHaveBeenCalledTimes(2);
    const [first] = mocks.sendEmail.mock.calls[0];
    expect(first.to).toBe("amy@example.com");
    expect(first.subject).toBe("Welcome back");
    expect(first.html).toContain("unsubscribe?token=amy@example.com");
    expect(first.headers).toEqual({
      "List-Unsubscribe": "<https://lug.example/api/amy@example.com>",
    });
    expect(mocks.updateEmail).toHaveBeenCalledWith("email-1", {
      status: "SENT",
      sentAt: expect.any(Date),
      recipientCount: 2,
    });
  });

  it("skips opted-out members", async () => {
    mocks.findAllOptedOutEmailAddresses.mockResolvedValue(["ben@example.com"]);

    await expect(deliverEmail(email)).resolves.toEqual({
      status: "sent",
      delivered: 1,
    });
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("does nothing when the group has no recipients", async () => {
    mocks.findAllOptedOutEmailAddresses.mockResolvedValue([
      "amy@example.com",
      "ben@example.com",
    ]);

    await expect(deliverEmail(email)).resolves.toEqual({
      status: "no_recipients",
    });
    expect(mocks.claimEmailForSending).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("doesn't send when another request already claimed the email", async () => {
    mocks.claimEmailForSending.mockResolvedValue({ ok: true, data: false });

    await expect(deliverEmail(email)).resolves.toEqual({
      status: "already_sent",
    });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("marks a partly sent email FAILED with the number that went out", async () => {
    mocks.sendEmail
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("mailbox full"));

    await expect(deliverEmail(email)).resolves.toEqual({
      status: "partial",
      delivered: 1,
      failed: 1,
    });
    expect(mocks.updateEmail).toHaveBeenCalledWith("email-1", {
      status: "FAILED",
      sentAt: expect.any(Date),
      recipientCount: 1,
    });
  });

  it("still reports the send, and logs it, when the final status update fails", async () => {
    mocks.updateEmail.mockResolvedValue({
      ok: false,
      error: { type: "database" },
    });

    await expect(deliverEmail(email)).resolves.toEqual({
      status: "sent",
      delivered: 2,
    });
    expect(console.error).toHaveBeenCalledWith(
      "Mailing list: failed to update email status",
      { emailId: "email-1", error: { type: "database" } },
    );
  });

  it("puts the email back to DRAFT when nothing could be sent", async () => {
    mocks.sendEmail.mockRejectedValue(new Error("connection refused"));

    await expect(deliverEmail(email)).resolves.toEqual({ status: "failed" });
    expect(mocks.updateEmail).toHaveBeenCalledWith("email-1", {
      status: "DRAFT",
    });
  });
});
