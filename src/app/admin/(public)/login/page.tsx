import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { loginAdmin } from "@/features/admin-auth/loginAdmin";

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
    <section className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Admin login</h1>
          <p className="mt-1 text-sm text-gray-600">
            For club executives only.
          </p>

          {showError && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              Invalid email or password. Please try again.
            </div>
          )}

          <form action={login} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={next ?? ""} />

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-900"
              >
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
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 transition focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 active:bg-gray-900"
            >
              Log in
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          Trouble logging in? Contact the website team.
        </p>
      </div>
    </section>
  );
}
