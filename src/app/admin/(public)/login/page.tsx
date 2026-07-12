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

  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  const { error } = await searchParams;
  const showError = error === "invalid";

  return (
    <section className="py-12">
      <div className="mx-auto max-w-sm rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin login</h1>
        <p className="mt-1 text-sm text-gray-600">For club executives only.</p>

        {showError && (
          <p className="mt-4 text-sm text-red-600">
            Invalid email or password.
          </p>
        )}

        <form action={login} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Log in
          </button>
        </form>
      </div>
    </section>
  );
}
