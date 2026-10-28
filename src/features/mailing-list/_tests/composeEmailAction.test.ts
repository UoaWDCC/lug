import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
  requireAdmin: vi.fn(),
  findAdminById: vi.fn(),
  createEmail: vi.fn(),
  findEmailById: vi.fn(),
  updateEmail: vi.fn(),
  deliverEmail: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth/session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/repositories/adminRepository", () => ({
  findAdminById: mocks.findAdminById,
}));
vi.mock("@/repositories/emailRepository", () => ({
  createEmail: mocks.createEmail,
  findEmailById: mocks.findEmailById,
  updateEmail: mocks.updateEmail,
}));
vi.mock("../deliverEmail", () => ({ deliverEmail: mocks.deliverEmail }));

import { composeEmailAction } from "../composeEmailAction";

function form(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return formData;
}

// redirect() throws in Next.js too, so the action stops there
async function submit(fields: Record<string, string>): Promise<string> {
  const error = await composeEmailAction(form(fields)).catch((e) => e);
  return String(error.message).replace("redirect:", "");
}

const content = { audience: "all", subject: "Hi", body: "Hello" };
const savedEmail = { id: "email-1", status: "DRAFT" };

beforeEach(() => {
  mocks.requireAdmin.mockResolvedValue({ adminId: "admin-1" });
  mocks.findAdminById.mockResolvedValue({ firstName: "Ada", lastName: "Lee" });
  mocks.createEmail.mockResolvedValue({ ok: true, data: savedEmail });
  mocks.updateEmail.mockResolvedValue({ ok: true, data: savedEmail });
  mocks.findEmailById.mockResolvedValue(null);
});

describe("composeEmailAction", () => {
  it("saves a new draft and reopens it", async () => {
    const url = await submit({ intent: "draft", ...content });

    expect(url).toBe("/admin/emails?notice=draft&draft=email-1");
    expect(mocks.createEmail).toHaveBeenCalledWith({
      audience: "ALL",
      subject: "Hi",
      body: "Hello",
      authorName: "Ada Lee",
    });
    expect(mocks.deliverEmail).not.toHaveBeenCalled();
  });

  it("updates the draft being edited instead of creating another", async () => {
    mocks.findEmailById.mockResolvedValue(savedEmail);

    await submit({ intent: "draft", emailId: "email-1", ...content });

    expect(mocks.updateEmail).toHaveBeenCalledWith("email-1", {
      audience: "ALL",
      subject: "Hi",
      body: "Hello",
    });
    expect(mocks.createEmail).not.toHaveBeenCalled();
  });

  it("never overwrites an email that was already sent", async () => {
    mocks.findEmailById.mockResolvedValue({ id: "email-1", status: "SENT" });

    await submit({ intent: "draft", emailId: "email-1", ...content });

    expect(mocks.updateEmail).not.toHaveBeenCalled();
    expect(mocks.createEmail).toHaveBeenCalled();
  });

  it("rejects sending without a subject, before saving anything", async () => {
    const url = await submit({ intent: "send", ...content, subject: " " });

    expect(url).toBe("/admin/emails?notice=invalid");
    expect(mocks.createEmail).not.toHaveBeenCalled();
  });

  it("saves, sends and reports how many recipients got it", async () => {
    mocks.deliverEmail.mockResolvedValue({ status: "sent", delivered: 3 });

    const url = await submit({ intent: "send", ...content });

    expect(mocks.deliverEmail).toHaveBeenCalledWith(savedEmail);
    expect(url).toBe("/admin/emails?notice=sent&count=3");
  });

  it("keeps the draft open when nothing could be sent", async () => {
    mocks.deliverEmail.mockResolvedValue({ status: "failed" });

    const url = await submit({ intent: "send", ...content });

    expect(url).toBe("/admin/emails?notice=failed&draft=email-1");
  });
});
