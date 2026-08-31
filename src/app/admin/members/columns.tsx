import type { ColumnDef } from "@tanstack/react-table";
import type { Member } from "@/generated/prisma/client";
import deleteMemberAction from "@/features/admin-members/deleteMemberAction";
import {
  formatBoolean,
  formatEnum,
  formatEnumList,
  truncateText,
} from "./utils";

export const columns: ColumnDef<Member>[] = [
  {
    id: "name",
    header: "Name",
    accessorFn: (member) => `${member.firstName} ${member.lastName}`,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "registrationYear",
    header: "Registration year",
  },
  {
    accessorKey: "isCurrentUoaStudent",
    header: "UoA student",
    filterFn: "equals",
    cell: ({ getValue }) =>
      formatBoolean(getValue<boolean | null | undefined>()),
  },
  {
    accessorKey: "upi",
    header: "UPI",
    cell: ({ getValue }) => getValue<string | null>() ?? "—",
  },
  {
    accessorKey: "studentId",
    header: "Student ID",
    cell: ({ getValue }) => getValue<string | null>() ?? "—",
  },
  {
    accessorKey: "faculty",
    header: "Faculty",
    cell: ({ getValue }) => {
      const faculties = getValue<string[]>();
      return faculties.length > 0 ? faculties.join(", ") : "—";
    },
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
    cell: ({ getValue }) => getValue<number | null>() ?? "—",
  },
  {
    accessorKey: "primaryAffiliation",
    header: "Primary affiliation",
    cell: ({ getValue }) => getValue<string | null>() ?? "—",
  },
  {
    accessorKey: "nonUoaExcerpt",
    header: "Non-UoA excerpt",
    cell: ({ getValue }) => truncateText(getValue<string | null>()),
  },
  {
    accessorKey: "nonUoaPitch",
    header: "Non-UoA pitch",
    cell: ({ getValue }) => truncateText(getValue<string | null>()),
  },
  {
    accessorKey: "linuxSkillLevel",
    header: "Linux skill",
    cell: ({ getValue }) => formatEnum(getValue<string>()),
  },
  {
    accessorKey: "potentialInvolvement",
    header: "Potential involvement",
    cell: ({ getValue }) => formatEnumList(getValue<string[]>()),
  },
  {
    accessorKey: "discordUsername",
    header: "Discord username",
    cell: ({ getValue }) => getValue<string | null>() ?? "—",
  },
  {
    accessorKey: "isConditionalReturningMember",
    header: "Member status",
    filterFn: "equals",
    cell: ({ getValue }) =>
      formatBoolean(getValue<boolean | null | undefined>()),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const member = row.original;
      return (
        <button
          type="button"
          onClick={async () => {
            const confirmed = window.confirm(
              `Are you sure you want to delete ${member.firstName} ${member.lastName}?`,
            );

            if (!confirmed) {
              return;
            }

            await deleteMemberAction(member.id);
          }}
          className="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
        >
          Delete
        </button>
      );
    },
  },
];
