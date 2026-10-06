import { validateLoginInput } from "@/domain/admin/validation";
import { findAdminByEmail } from "@/repositories/adminRepository";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

type LoginResult = { ok: true } | { ok: false; error: string };

export async function loginAdmin(raw: {
  email: unknown;
  password: unknown;
}): Promise<LoginResult> {
  const validated = validateLoginInput(raw);
  if (!validated.ok) {
    return { ok: false, error: validated.error };
  }

  const { email, password } = validated.data;
  const admin = await findAdminByEmail(email);

  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return { ok: false, error: "Invalid email or password" };
  }

  const token = await createSessionToken({
    adminId: admin.id,
    role: admin.role,
  });
  await setSessionCookie(token);

  return { ok: true };
}
