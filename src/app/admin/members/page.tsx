import { getMockMembers } from "@/lib/mock/members";

export default async function AdminMembersPage() {
  const members = await getMockMembers();

  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold tracking-tight">Members</h1>
      <p className="mt-1 text-sm text-gray-600">{members.length} registered</p>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Linux skill</th>
              <th className="px-4 py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr
                key={m.email}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-2">
                  {m.firstName} {m.lastName}
                </td>
                <td className="px-4 py-2">{m.email}</td>
                <td className="px-4 py-2">{m.linuxSkillLevel}</td>
                <td className="px-4 py-2">{m.joinedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
