import type { Member } from "@/generated/prisma/client";

import { formatEnum, formatEnumList, formatBoolean } from "./utils";

const exportColumns = [
  { header: "Name", value: (m: Member) => `${m.firstName} ${m.lastName}` },
  { header: "Email", value: (m: Member) => m.email },
  { header: "Registration year", value: (m: Member) => m.registrationYear },
  {
    header: "UoA student",
    value: (m: Member) => formatBoolean(m.isCurrentUoaStudent),
  },
  { header: "UPI", value: (m: Member) => m.upi ?? "-" },
  { header: "Student ID", value: (m: Member) => m.studentId ?? "-" },
  {
    header: "Faculty",
    value: (m: Member) => (m.faculty.length ? m.faculty.join(", ") : "-"),
  },
  {
    header: "Programme type",
    value: (m: Member) => formatEnum(m.programmeType),
  },
  {
    header: "Majors",
    value: (m: Member) => (m.majors.length ? m.majors.join(", ") : "-"),
  },
  { header: "Years remaining", value: (m: Member) => m.yearsRemaining ?? "-" },
  {
    header: "Primary affiliation",
    value: (m: Member) => m.primaryAffiliation ?? "-",
  },
  { header: "Non-UoA excerpt", value: (m: Member) => m.nonUoaExcerpt ?? "-" },
  { header: "Non-UoA pitch", value: (m: Member) => m.nonUoaPitch ?? "-" },
  {
    header: "Linux skill",
    value: (m: Member) => formatEnum(m.linuxSkillLevel),
  },
  {
    header: "Potential involvement",
    value: (m: Member) => formatEnumList(m.potentialInvolvement),
  },
  {
    header: "Discord username",
    value: (m: Member) => m.discordUsername ?? "-",
  },
] satisfies { header: string; value: (member: Member) => unknown }[];

function escapeCsv(value: unknown): string {
  let text = value == null ? "" : String(value);

  if (/^[\t\r ]*[=+\@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function exportMembers(members: Member[]): void {
  const header = exportColumns.map(({ header }) => escapeCsv(header));
  const rows = members.map((member) =>
    exportColumns.map(({ value }) => escapeCsv(value(member))),
  );

  const csv = [header, ...rows].map((row) => row.join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "members.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
