import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/domain/admin/types";

export const SESSION_COOKIE_NAME = "lug_admin_session";

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type AdminSession = {
  adminId: number;
  role: Role;
};

/**
 * Encodes env's AUTH_SECRET as bytes
 * This string secret is used to sign and verify every JWT; anyone who has it can forge valid tokens
 */

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set.");
  }
  return new TextEncoder().encode(secret);
}

// Reads SESSION_MAX_AGE_SECONDS from env, falls back to 7 days
function getMaxAgeSeconds() {
  const fromEnv = process.env.SESSION_MAX_AGE_SECONDS;
  if (!fromEnv) return DEFAULT_MAX_AGE_SECONDS;
  const parsed = Number(fromEnv);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MAX_AGE_SECONDS;
}

export async function createSessionToken(
  session: AdminSession,
): Promise<string> {
  const maxAge = getMaxAgeSeconds();
  return (
    new SignJWT({ role: session.role })
      /* Session security settings */
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(session.adminId))
      .setIssuedAt()
      .setExpirationTime(`${maxAge}s`)
      .sign(getSecretKey())
  );
}

/**
 * The jwtVerify call does three things:
 * Checks the signature matches the secret (proving nobody tampered with it), checks exp hasn't passed (auto-rejects expired tokens), and returns the payload.
 *
 * Then, the function pulls the payload's adminId and role, returning them as the AdminSession object.
 * If anything fails (bad signature, expired, malformed), it catches and returns null.
 */

export async function verifySessionToken(
  token: string,
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const adminId = Number(payload.sub);
    const role = payload.role;

    if (!Number.isInteger(adminId) || typeof role !== "string") {
      return null;
    }

    return { adminId, role: role as Role };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true, // JavaScript in the browser can't read this cookie (protects against XSS stealing the token)
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Cookie sent on same-site requests and top-level navigations, but not on cross-site POST requests (basic CSRF protection)
    path: "/",
    maxAge: getMaxAgeSeconds(),
  });
}

// Since JWTs are stateless, this is the only logout mechanism
export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
