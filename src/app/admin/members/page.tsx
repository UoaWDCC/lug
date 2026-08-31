import { requireAdmin } from "@/lib/auth/session";
import { findAllMembers } from "@/repositories/memberRepository";

import MembersTable from "./MembersTable";

export default async function AdminMembersPage() {
  await requireAdmin();
  const members = await findAllMembers();
  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold tracking-tight">Members</h1>
      <p className="mt-1 text-sm text-gray-600">{members.length} registered</p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
        <MembersTable data={members} />
      </div>
    </section>
  );
}
