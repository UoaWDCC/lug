import Link from "next/link";

import { scrollableMainClass } from "@/components/primitive/buttonStyles";

export default function AdminPage() {
  return (
    <main className={scrollableMainClass}>
      <h1 className="text-2xl font-semibold">Admin</h1>

      <div className="mt-6">
        <Link href="/admin/members" className="underline">
          View members
        </Link>
      </div>
    </main>
  );
}
