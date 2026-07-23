
import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Admin</h1>

      <div className="mt-6">
        <Link href="/admin/members" className="underline">
          View members
        </Link>
      </div>
    </main>
  );
}
