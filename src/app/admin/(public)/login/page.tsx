import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { loginAdmin } from "@/features/admin-auth/loginAdmin";
import { accentButtonClass } from "@/components/primitive/buttonStyles";
import {
  adminErrorClass,
  adminInputClass,
  adminLabelClass,
} from "@/app/admin/_lib/adminStyles";

async function login(formData: FormData) {
  "use server";

  const result = await loginAdmin({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.ok) {
    redirect("/admin/login?error=invalid");
  }

  const next = formData.get("next") as string | null;
  const target = next?.startsWith("/admin") ? next : "/admin";
  redirect(target);
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  const { error, next } = await searchParams;
  const showError = error === "invalid";

  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <Image
            src="/logo.svg"
            alt=""
            width={48}
            height={48}
            priority
            className="h-12 w-12 rounded-full"
          />
          <span className="font-sans text-3xl font-black tracking-[-0.3px]">
            LUG@UoA
          </span>
          <span className="rounded-md border border-[var(--input-border)] bg-[var(--chip-bg)] px-2 py-0.5 font-mono text-xs font-medium tracking-wider text-[var(--accent-text)]">
            ADMIN
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--input-border)] bg-[var(--card-bg)] p-6 sm:p-8">
          <p className="font-mono text-sm text-[var(--muted)]">$ sudo login</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Admin login
          </h1>
          <p className="mt-1 text-[var(--muted)]">For club executives only.</p>

          {showError && (
            <div role="alert" className={`mt-6 ${adminErrorClass}`}>
              Invalid email or password. Please try again.
            </div>
          )}

          <form action={login} className="mt-6 space-y-5">
            <input type="hidden" name="next" value={next ?? ""} />

            <div>
              <label htmlFor="email" className={adminLabelClass}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                spellCheck={false}
                placeholder="you@example.com"
                className={adminInputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className={adminLabelClass}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className={adminInputClass}
              />
            </div>

            <button type="submit" className={`${accentButtonClass} w-full`}>
              Log in
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Trouble logging in? Contact the website team.
        </p>
      </div>
    </section>
  );
}
