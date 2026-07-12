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

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set.");
  }
  return new TextEncoder().encode(secret);
}

//Just a function to see how much time they have left on their login session in nice seconds format
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
      //Session security settings
      .setProtectedHeader({ alg: "HS256" })
      //The admin id is the subject of the token
      .setSubject(String(session.adminId))
      //The token is issued at this time
      .setIssuedAt()
      //The token expires in the amount of time set i set in the env
      .setExpirationTime(`${maxAge}s`)
      //The token is signed with the secret key
      .sign(getSecretKey())
  );
}

export async function verifySessionToken(
  token: string,
): Promise<AdminSession | null> {
  //Try to verify the token
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
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getMaxAgeSeconds(),
  });
}

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
