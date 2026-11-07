import type { ColumnDef } from "@tanstack/react-table";
import type { Member } from "@/generated/prisma/client";
import Link from "next/link";
import {
  adminBadgeClass,
  adminDeleteActionClass,
  adminEditActionClass,
} from "@/app/admin/_lib/adminStyles";
import {
  formatBoolean,
  formatEnum,
  formatEnumList,
  formatFaculties,
  truncateText,
} from "./utils";

/* Secondary values (emails, handles, IDs) are mono and muted, so names and badges lead the row. */
const monoMutedClass = "font-mono text-sm text-[var(--muted)]";

/* A factory so the Delete button can open the table's shared confirm dialog. */
export const createColumns = (
  onDelete: (member: Member) => void,
): ColumnDef<Member>[] => [
  {
    id: "name",
    header: "Name",
    accessorFn: (member) => `${member.firstName} ${member.lastName}`,
    cell: ({ getValue }) => (
      <span className="font-bold whitespace-nowrap">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => (
      <span className={monoMutedClass}>{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "registrationYear",
    header: "Year",
    filterFn: "equals",
    cell: ({ getValue }) => (
      <span className="font-mono">{getValue<number>()}</span>
    ),
  },
  {
    accessorKey: "isCurrentUoaStudent",
    header: "UoA",
    filterFn: "equals",
    cell: ({ getValue }) => {
      const value = getValue<boolean | null | undefined>();
      if (value === null || value === undefined) {
        return <span className="text-[var(--muted)]">—</span>;
      }
      return (
        <span
          className={
            value ? adminBadgeClass.positive : adminBadgeClass.negative
          }
        >
          {formatBoolean(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "upi",
    header: "UPI",
    cell: ({ getValue }) => (
      <span className={monoMutedClass}>{getValue<string | null>() ?? "—"}</span>
    ),
  },
  {
    accessorKey: "studentId",
    header: "Student ID",
    cell: ({ getValue }) => (
      <span className={monoMutedClass}>{getValue<string | null>() ?? "—"}</span>
    ),
  },
  {
    accessorKey: "faculty",
    header: "Faculty",
    cell: ({ getValue }) => formatFaculties(getValue<string[]>()),
  },
  {
    accessorKey: "programmeType",
    header: "Programme type",
    cell: ({ getValue }) => formatEnum(getValue<string | null>()),
  },
  {
    accessorKey: "majors",
    header: "Majors",
    cell: ({ getValue }) => {
      const majors = getValue<string[]>();
      return majors.length > 0 ? majors.join(", ") : "—";
    },
  },
  {
    accessorKey: "yearsRemaining",
    header: "Years remaining",
    filterFn: "equals",
    cell: ({ getValue }) => (
      <span className="font-mono">{getValue<number | null>() ?? "—"}</span>
    ),
  },
  {
    accessorKey: "primaryAffiliation",
    header: "Primary affiliation",
    cell: ({ getValue }) => getValue<string | null>() ?? "—",
  },
  {
    accessorKey: "nonUoaExcerpt",
    header: "Non-UoA excerpt",
    // Hovering shows the full text the cell cuts short.
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return <span title={value ?? undefined}>{truncateText(value)}</span>;
    },
  },
  {
    accessorKey: "nonUoaPitch",
    header: "Non-UoA pitch",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return <span title={value ?? undefined}>{truncateText(value)}</span>;
    },
  },
  {
    accessorKey: "linuxSkillLevel",
    header: "Linux skill",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">
        {formatEnum(getValue<string>())}
      </span>
    ),
  },
  {
    accessorKey: "potentialInvolvement",
    header: "Involvement",
    cell: ({ getValue }) => formatEnumList(getValue<string[]>()),
  },
  {
    accessorKey: "discordUsername",
    header: "Discord",
    cell: ({ getValue }) => (
      <span className={monoMutedClass}>{getValue<string | null>() ?? "—"}</span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/members/${member.id}/edit`}
            className={adminEditActionClass}
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onDelete(member)}
            className={adminDeleteActionClass}
          >
            Delete
          </button>
        </div>
      );
    },
  },
];
