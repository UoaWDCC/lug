import { requireAdmin } from "@/lib/auth/session";
import { findAllMembers } from "@/repositories/memberRepository";

import MembersTable from "./MembersTable";

export default async function AdminMembersPage() {
  await requireAdmin();

  const members = await findAllMembers();

  // The heading lives in MembersTable so its count can follow the filters.
  return (
    <section>
      <MembersTable data={members} />
    </section>
  );
}
