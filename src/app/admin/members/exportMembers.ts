import type { Member } from "@/generated/prisma/client";

import { formatEnum, formatEnumList, formatBoolean } from "./utils";

type ExportColumn = {
  id: string;
  header: string;
  value: (member: Member) => unknown;
};

export const exportColumns = [
  {
    id: "name",
    header: "Name",
    value: (m: Member) => `${m.firstName} ${m.lastName}`,
  },
  { id: "email", header: "Email", value: (m: Member) => m.email },
  {
    id: "registrationYear",
    header: "Registration year",
    value: (m: Member) => m.registrationYear,
  },
  {
    id: "isCurrentUoaStudent",
    header: "UoA student",
    value: (m: Member) => formatBoolean(m.isCurrentUoaStudent),
  },
  { id: "upi", header: "UPI", value: (m: Member) => m.upi ?? "-" },
  {
    id: "studentId",
    header: "Student ID",
    value: (m: Member) => m.studentId ?? "-",
  },
  {
    id: "faculty",
    header: "Faculty",
    value: (m: Member) => (m.faculty.length ? m.faculty.join(", ") : "-"),
  },
  {
    id: "programmeType",
    header: "Programme type",
    value: (m: Member) => formatEnum(m.programmeType),
  },
  {
    id: "majors",
    header: "Majors",
    value: (m: Member) => (m.majors.length ? m.majors.join(", ") : "-"),
  },
  {
    id: "yearRemaining",
    header: "Years remaining",
    value: (m: Member) => m.yearsRemaining ?? "-",
  },
  {
    id: "primaryAffiliation",
    header: "Primary affiliation",
    value: (m: Member) => m.primaryAffiliation ?? "-",
  },
  {
    id: "nonUoaExcerpt",
    header: "Non-UoA excerpt",
    value: (m: Member) => m.nonUoaExcerpt ?? "-",
  },
  {
    id: "nonUoaPitch",
    header: "Non-UoA pitch",
    value: (m: Member) => m.nonUoaPitch ?? "-",
  },
  {
    id: "linuxSkillLevel",
    header: "Linux skill",
    value: (m: Member) => formatEnum(m.linuxSkillLevel),
  },
  {
    id: "potentialInvolvement",
    header: "Potential involvement",
    value: (m: Member) => formatEnumList(m.potentialInvolvement),
  },
  {
    id: "discordUsername",
    header: "Discord username",
    value: (m: Member) => m.discordUsername ?? "-",
  },
] satisfies ExportColumn[];

function escapeCsv(value: unknown): string {
  let text = value == null ? "" : String(value);

  if (/^[\t\r ]*[=+\@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function exportMembers(
  members: Member[],
  selectedColumns: ExportColumn[] = exportColumns,
): void {
  const header = selectedColumns.map(({ header }) => escapeCsv(header));
  const rows = members.map((member) =>
    selectedColumns.map(({ value }) => escapeCsv(value(member))),
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
