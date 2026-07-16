export type LoginInput = {
  email: string;
  password: string;
};

type ValidationSuccess<T> = { ok: true; data: T };
type ValidationFailure = { ok: false; error: string };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginInput(raw: {
  email: unknown;
  password: unknown;
}): ValidationResult<LoginInput> {
  const email =
    typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const password = typeof raw.password === "string" ? raw.password : "";

  if (!email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Invalid email or password" };
  }

  if (!password) {
    return { ok: false, error: "Invalid email or password" };
  }

  return { ok: true, data: { email, password } };
}
