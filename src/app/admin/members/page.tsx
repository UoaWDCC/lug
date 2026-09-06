import { requireAdmin } from "@/lib/auth/session";
import { findAllMembers } from "@/repositories/memberRepository";
import {
  formatBoolean,
  formatEnum,
  formatEnumList,
  truncateText,
} from "./utils";
import Link from "next/link";

export default async function AdminMembersPage() {
  await requireAdmin();
  const members = await findAllMembers();
  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold tracking-tight">Members</h1>
      <p className="mt-1 text-sm text-gray-600">{members.length} registered</p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-2 font-medium">Actions</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Registration year</th>
              <th className="px-4 py-2 font-medium">UoA student</th>
              <th className="px-4 py-2 font-medium">UPI</th>
              <th className="px-4 py-2 font-medium">Student ID</th>
              <th className="px-4 py-2 font-medium">Faculty</th>
              <th className="px-4 py-2 font-medium">Programme type</th>
              <th className="px-4 py-2 font-medium">Majors</th>
              <th className="px-4 py-2 font-medium">Years remaining</th>
              <th className="px-4 py-2 font-medium">Primary affiliation</th>
              <th className="px-4 py-2 font-medium">Non-UoA excerpt</th>
              <th className="px-4 py-2 font-medium">Non-UoA pitch</th>
              <th className="px-4 py-2 font-medium">Linux skill</th>
              <th className="px-4 py-2 font-medium">Potential involvement</th>
              <th className="px-4 py-2 font-medium">Discord username</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr
                key={m.id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-2">
                  <Link
                    href={`/admin/members/${m.id}/edit`}
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    Edit
                  </Link>
                </td>
                <td className="px-4 py-2">
                  {m.firstName} {m.lastName}
                </td>
                <td className="px-4 py-2">{m.email}</td>
                <td className="px-4 py-2">{m.registrationYear}</td>
                <td className="px-4 py-2">
                  {formatBoolean(m.isCurrentUoaStudent)}
                </td>
                <td className="px-4 py-2">{m.upi ?? "—"}</td>
                <td className="px-4 py-2">{m.studentId ?? "—"}</td>
                <td className="px-4 py-2">
                  {m.faculty.length > 0 ? m.faculty.join(", ") : "—"}
                </td>
                <td className="px-4 py-2">{formatEnum(m.programmeType)}</td>
                <td className="px-4 py-2">
                  {m.majors.length > 0 ? m.majors.join(", ") : "—"}
                </td>
                <td className="px-4 py-2">{m.yearsRemaining ?? "—"}</td>
                <td className="px-4 py-2">{m.primaryAffiliation ?? "—"}</td>
                <td className="px-4 py-2">{truncateText(m.nonUoaExcerpt)}</td>
                <td className="px-4 py-2">{truncateText(m.nonUoaPitch)}</td>
                <td className="px-4 py-2">{formatEnum(m.linuxSkillLevel)}</td>
                <td className="px-4 py-2">
                  {formatEnumList(m.potentialInvolvement)}
                </td>
                <td className="px-4 py-2">{m.discordUsername ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
