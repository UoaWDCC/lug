import { SignJWT, jwtVerify } from "jose";
import { normaliseEmail } from "@/domain/email/audience";
import { getSecretKey } from "@/lib/auth/session";

// Marks these tokens as unsubscribe-only, so a session token can't be used here (and vice versa)
const UNSUBSCRIBE_AUDIENCE = "unsubscribe";

// No expiry: an unsubscribe link in an old email must keep working
export async function createUnsubscribeToken(email: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(normaliseEmail(email))
    .setAudience(UNSUBSCRIBE_AUDIENCE)
    .setIssuedAt()
    .sign(getSecretKey());
}

// Returns the lowercased email the token was made for, or null if it's invalid or tampered with
export async function verifyUnsubscribeToken(
  token: string,
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
      audience: UNSUBSCRIBE_AUDIENCE,
    });
    return typeof payload.sub === "string" && payload.sub !== ""
      ? payload.sub
      : null;
  } catch {
    return null;
  }
}

export type UnsubscribeLinks = {
  /** Footer link: opens a confirm page, never unsubscribes on its own */
  pageUrl: string;
  /** RFC 8058 headers for the inbox's own "Unsubscribe" button */
  headers: {
    "List-Unsubscribe": string;
    "List-Unsubscribe-Post": string;
  };
};

export async function buildUnsubscribeLinks(
  email: string,
): Promise<UnsubscribeLinks> {
  const token = encodeURIComponent(await createUnsubscribeToken(email));
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");

  return {
    pageUrl: `${siteUrl}/unsubscribe?token=${token}`,
    headers: {
      "List-Unsubscribe": `<${siteUrl}/api/unsubscribe?token=${token}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
