import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verifyUnsubscribeToken: vi.fn(),
  addEmailAddressOptOut: vi.fn(),
  removeEmailAddressOptOut: vi.fn(),
}));

vi.mock("@/lib/email/unsubscribe", () => ({
  verifyUnsubscribeToken: mocks.verifyUnsubscribeToken,
}));
vi.mock("@/repositories/emailAddressOptOutRepository", () => ({
  addEmailAddressOptOut: mocks.addEmailAddressOptOut,
  removeEmailAddressOptOut: mocks.removeEmailAddressOptOut,
}));

import { updateSubscription } from "../updateSubscription";

beforeEach(() => {
  mocks.verifyUnsubscribeToken.mockResolvedValue("sam@example.com");
  mocks.addEmailAddressOptOut.mockResolvedValue({ ok: true, data: {} });
  mocks.removeEmailAddressOptOut.mockResolvedValue({ ok: true, data: 1 });
});

describe("updateSubscription", () => {
  it("opts the token's email out", async () => {
    await expect(updateSubscription("token", "unsubscribe")).resolves.toBe(
      "unsubscribed",
    );
    expect(mocks.verifyUnsubscribeToken).toHaveBeenCalledWith("token");
    expect(mocks.addEmailAddressOptOut).toHaveBeenCalledWith("sam@example.com");
  });

  it("removes the opt-out when resubscribing", async () => {
    await expect(updateSubscription("token", "resubscribe")).resolves.toBe(
      "resubscribed",
    );
    expect(mocks.removeEmailAddressOptOut).toHaveBeenCalledWith(
      "sam@example.com",
    );
    expect(mocks.addEmailAddressOptOut).not.toHaveBeenCalled();
  });

  it("changes nothing when the token is invalid", async () => {
    mocks.verifyUnsubscribeToken.mockResolvedValue(null);

    await expect(updateSubscription("bad", "unsubscribe")).resolves.toBe(
      "invalid_token",
    );
    expect(mocks.addEmailAddressOptOut).not.toHaveBeenCalled();
    expect(mocks.removeEmailAddressOptOut).not.toHaveBeenCalled();
  });

  it("reports a database failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.addEmailAddressOptOut.mockResolvedValue({
      ok: false,
      error: { type: "database" },
    });

    await expect(updateSubscription("token", "unsubscribe")).resolves.toBe(
      "error",
    );
  });
});
