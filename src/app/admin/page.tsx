import Link from "next/link";

import { scrollableMainClass } from "@/components/primitive/buttonStyles";

export default function AdminPage() {
  return (
    <main className={scrollableMainClass}>
      <h1 className="text-4xl font-semibold">Admin</h1>

      <div className="mt-7">
        <Link href="/admin/members" className="text-xl underline">
          View members
        </Link>
      </div>
    </main>
  );
}
