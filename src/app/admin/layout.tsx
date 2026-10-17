import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { findAdminById } from "@/repositories/adminRepository";
import { logoutAdmin } from "@/features/admin-auth/logoutAdmin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Fetch admin only if a session exists
  const admin = session ? await findAdminById(session.adminId) : null;

  async function handleLogout() {
    "use server";
    await logoutAdmin();
    redirect("/admin/login");
  }

  return (
    /* Outermost wrapper div with min-h-screen and full viewport background */
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {session && (
        <nav className="flex items-center gap-4 p-4 border-b border-gray-300">
          {/* Fix 1: Display firstName and lastName */}
          <span>
            Welcome, {admin ? `${admin.firstName} ${admin.lastName}` : "Admin"}
          </span>
          <Link href="/admin/members" className="hover:underline">
            Members
          </Link>
          <form action={handleLogout}>
            <button type="submit" className="cursor-pointer hover:underline">
              Logout
            </button>
          </form>
        </nav>
      )}

      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
