import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verifyUnsubscribeToken: vi.fn(),
  addEmailOptOut: vi.fn(),
  removeEmailOptOut: vi.fn(),
}));

vi.mock("@/lib/email/unsubscribe", () => ({
  verifyUnsubscribeToken: mocks.verifyUnsubscribeToken,
}));
vi.mock("@/repositories/emailOptOutRepository", () => ({
  addEmailOptOut: mocks.addEmailOptOut,
  removeEmailOptOut: mocks.removeEmailOptOut,
}));

import { updateSubscription } from "../updateSubscription";

beforeEach(() => {
  mocks.verifyUnsubscribeToken.mockResolvedValue("sam@example.com");
  mocks.addEmailOptOut.mockResolvedValue({ ok: true, data: {} });
  mocks.removeEmailOptOut.mockResolvedValue({ ok: true, data: 1 });
});

describe("updateSubscription", () => {
  it("opts the token's email out", async () => {
    await expect(updateSubscription("token", "unsubscribe")).resolves.toBe(
      "unsubscribed",
    );
    expect(mocks.verifyUnsubscribeToken).toHaveBeenCalledWith("token");
    expect(mocks.addEmailOptOut).toHaveBeenCalledWith("sam@example.com");
  });

  it("removes the opt-out when resubscribing", async () => {
    await expect(updateSubscription("token", "resubscribe")).resolves.toBe(
      "resubscribed",
    );
    expect(mocks.removeEmailOptOut).toHaveBeenCalledWith("sam@example.com");
    expect(mocks.addEmailOptOut).not.toHaveBeenCalled();
  });

  it("changes nothing when the token is invalid", async () => {
    mocks.verifyUnsubscribeToken.mockResolvedValue(null);

    await expect(updateSubscription("bad", "unsubscribe")).resolves.toBe(
      "invalid_token",
    );
    expect(mocks.addEmailOptOut).not.toHaveBeenCalled();
    expect(mocks.removeEmailOptOut).not.toHaveBeenCalled();
  });

  it("reports a database failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.addEmailOptOut.mockResolvedValue({
      ok: false,
      error: { type: "database" },
    });

    await expect(updateSubscription("token", "unsubscribe")).resolves.toBe(
      "error",
    );
  });
});
