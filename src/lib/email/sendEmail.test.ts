import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createTransport, sendMail } = vi.hoisted(() => ({
  createTransport: vi.fn(),
  sendMail: vi.fn(),
}));

vi.mock("nodemailer", () => ({ default: { createTransport } }));

import { sendEmail } from "./sendEmail";

const email = {
  to: "sam@example.com",
  subject: "Hello",
  html: "<p>Hi</p>",
  text: "Hi",
  headers: { "List-Unsubscribe": "<https://lug.example/api/unsubscribe>" },
};

beforeEach(() => {
  createTransport.mockReturnValue({ sendMail });
  sendMail.mockResolvedValue({});
  vi.stubEnv("SMTP_HOST", "localhost");
  vi.stubEnv("SMTP_PORT", "1025");
  vi.stubEnv("SMTP_USER", "");
  vi.stubEnv("SMTP_PASS", "");
  vi.stubEnv("EMAIL_FROM", "LUG@UoA <no-reply@example.com>");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sendEmail", () => {
  it("sends one message from EMAIL_FROM with the given content and headers", async () => {
    await sendEmail(email);

    expect(sendMail).toHaveBeenCalledWith({
      from: "LUG@UoA <no-reply@example.com>",
      ...email,
    });
  });

  it("connects without a login when SMTP_USER is empty (Mailpit)", async () => {
    await sendEmail(email);

    expect(createTransport).toHaveBeenCalledWith({
      host: "localhost",
      port: 1025,
      secure: false,
      auth: undefined,
    });
  });

  it("logs in and uses TLS on port 465", async () => {
    vi.stubEnv("SMTP_PORT", "465");
    vi.stubEnv("SMTP_USER", "club@example.com");
    vi.stubEnv("SMTP_PASS", "app-password");

    await sendEmail(email);

    expect(createTransport).toHaveBeenCalledWith({
      host: "localhost",
      port: 465,
      secure: true,
      auth: { user: "club@example.com", pass: "app-password" },
    });
  });

  it("throws before connecting when SMTP settings are missing", async () => {
    vi.stubEnv("SMTP_HOST", "");

    await expect(sendEmail(email)).rejects.toThrow("SMTP_HOST");
    expect(createTransport).not.toHaveBeenCalled();
  });

  it("passes on SMTP errors so the caller can mark the send as failed", async () => {
    sendMail.mockRejectedValue(new Error("connection refused"));

    await expect(sendEmail(email)).rejects.toThrow("connection refused");
  });
});
