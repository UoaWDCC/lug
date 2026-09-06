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
    <div className="admin-layout-wrapper">
      {session && (
        <nav
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            padding: "1rem",
            borderBottom: "1px solid #ccc",
          }}
        >
          <span>Welcome, {admin?.name || "Admin"}</span>
          <Link href="/admin/members">Members</Link>
          <form action={handleLogout}>
            <button type="submit" style={{ cursor: "pointer" }}>
              Logout
            </button>
          </form>
        </nav>
      )}

      <main style={{ padding: "1rem" }}>{children}</main>
    </div>
  );
}
