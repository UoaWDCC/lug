// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ updateSubscription: vi.fn() }));

vi.mock("@/features/mailing-list/updateSubscription", () => ({
  updateSubscription: mocks.updateSubscription,
}));

import { POST } from "../route";

// What a mail provider sends when someone clicks the inbox's Unsubscribe button
function oneClick(token: string): NextRequest {
  return new NextRequest(
    `http://localhost:3000/api/unsubscribe?token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "List-Unsubscribe=One-Click",
    },
  );
}

describe("POST /api/unsubscribe", () => {
  it("unsubscribes the token's email", async () => {
    mocks.updateSubscription.mockResolvedValue("unsubscribed");

    const response = await POST(oneClick("a.b.c"));

    expect(response.status).toBe(200);
    expect(mocks.updateSubscription).toHaveBeenCalledWith(
      "a.b.c",
      "unsubscribe",
    );
  });

  it("rejects an invalid token", async () => {
    mocks.updateSubscription.mockResolvedValue("invalid_token");

    const response = await POST(oneClick("tampered"));

    expect(response.status).toBe(400);
  });

  it("returns 500 when the database fails", async () => {
    mocks.updateSubscription.mockResolvedValue("error");

    const response = await POST(oneClick("a.b.c"));

    expect(response.status).toBe(500);
  });
});
