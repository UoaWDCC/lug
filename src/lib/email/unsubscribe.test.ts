// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionToken } from "@/lib/auth/session";
import {
  buildUnsubscribeLinks,
  createUnsubscribeToken,
  decodeUnsubscribeToken,
} from "./unsubscribe";

beforeEach(() => {
  vi.stubEnv("AUTH_SECRET", "test-secret-that-is-long-enough-123");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://lug.example");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function base64UrlJson(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

describe("unsubscribe tokens", () => {
  it("round-trips to the lowercased email", async () => {
    const token = await createUnsubscribeToken("  Sam@Example.COM ");

    await expect(decodeUnsubscribeToken(token)).resolves.toBe(
      "sam@example.com",
    );
  });

  it("rejects a token whose email was swapped", async () => {
    const [header, , signature] = (
      await createUnsubscribeToken("sam@example.com")
    ).split(".");
    const forgedPayload = base64UrlJson({
      sub: "someone-else@example.com",
      aud: "unsubscribe",
    });

    await expect(
      decodeUnsubscribeToken(`${header}.${forgedPayload}.${signature}`),
    ).resolves.toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createUnsubscribeToken("sam@example.com");
    vi.stubEnv("AUTH_SECRET", "a-completely-different-secret-456");

    await expect(decodeUnsubscribeToken(token)).resolves.toBeNull();
  });

  it("rejects an admin session token", async () => {
    const sessionToken = await createSessionToken({
      adminId: 1,
      role: "PRESIDENT",
    });

    await expect(decodeUnsubscribeToken(sessionToken)).resolves.toBeNull();
  });

  it("rejects garbage", async () => {
    await expect(decodeUnsubscribeToken("not-a-token")).resolves.toBeNull();
  });
});

describe("buildUnsubscribeLinks", () => {
  it("builds a page link and one-click headers with a valid token", async () => {
    const { pageUrl, headers } = await buildUnsubscribeLinks("sam@example.com");

    const page = new URL(pageUrl);
    expect(page.origin + page.pathname).toBe("https://lug.example/unsubscribe");
    await expect(
      decodeUnsubscribeToken(page.searchParams.get("token") ?? ""),
    ).resolves.toBe("sam@example.com");

    expect(headers["List-Unsubscribe"]).toMatch(
      /^<https:\/\/lug\.example\/unsubscribe\/api\?token=[^>]+>$/,
    );
    expect(headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });
});
