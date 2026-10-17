import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { findAdminById } from "@/repositories/adminRepository";
import { logoutAdmin } from "@/features/admin-auth/logoutAdmin";
import { AdminHeader } from "./_components/AdminHeader";
import { ThemeFadeSync } from "./_components/ThemeFadeSync";

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
    <div className="admin-shell flex min-h-screen flex-col bg-[var(--bg)] text-[var(--fg)]">
      <ThemeFadeSync />
      {session && (
        <AdminHeader
          adminName={admin ? `${admin.firstName} ${admin.lastName}` : "Admin"}
          logoutAction={handleLogout}
        />
      )}

      <main className="flex-1 px-5 py-12 sm:px-14 sm:py-16">{children}</main>
    </div>
  );
}
