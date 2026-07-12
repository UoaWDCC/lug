import { clearSessionCookie } from "@/lib/auth/session";

export async function logoutAdmin(): Promise<void> {
  await clearSessionCookie();
}
