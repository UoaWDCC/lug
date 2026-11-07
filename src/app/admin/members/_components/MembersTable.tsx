"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type Table,
} from "@tanstack/react-table";

import type { Member } from "@/generated/prisma/client";
import {
  FACULTY_OPTIONS,
  VALID_PROGRAMME_TYPES,
  VALID_SKILL_LEVELS,
  VALID_YEARS_REMAINING,
} from "@/domain/member/constants";
import {
  adminPinnedClass,
  adminRowClass,
  adminTableWrapClass,
  adminTdClass,
  adminThClass,
} from "@/app/admin/_lib/adminStyles";

import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { AdminSelect } from "@/app/admin/_components/AdminSelect";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import deleteMemberAction from "@/features/admin-members/deleteMemberAction";

import { createColumns } from "../_lib/columns";
import { formatEnum } from "../_lib/utils";

interface MembersTableProps {
  data: Member[];
}

const filterLabelClass = "mr-3 text-[var(--muted)]";

/* Name and Actions stay visible while the other columns scroll sideways. */
const pinnedColumns: Record<string, string> = {
  name: adminPinnedClass.left,
  actions: adminPinnedClass.right,
};

/* "4 non-UoA students in 2026", "1 member", ... - describes whatever the filters currently show. */
const deleteErrorMessages = {
  invalid_id: "That member ID is invalid.",
  not_found:
    "That member no longer exists. Refresh the page to update the list.",
  database: "The member could not be deleted. Please try again.",
};

function describeCount(
  count: number,
  uoa: boolean | undefined,
  year: number | undefined,
) {
  const noun =
    uoa === true ? "UoA student" : uoa === false ? "non-UoA student" : "member";
  return `${count} ${noun}${count === 1 ? "" : "s"}${year ? ` in ${year}` : ""}`;
}

/* ── Filter select ──────────────────────────────────────────────── */

interface FilterOption {
  value: string;
  label: string;
}

const UOA_STUDENT_OPTIONS: FilterOption[] = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

const PROGRAMME_TYPE_OPTIONS: FilterOption[] = VALID_PROGRAMME_TYPES.map(
  (programmeType) => ({
    value: programmeType,
    label: formatEnum(programmeType),
  }),
);

const YEARS_REMAINING_OPTIONS: FilterOption[] = VALID_YEARS_REMAINING.map(
  (years, index) => ({
    value: String(years),
    label:
      index === VALID_YEARS_REMAINING.length - 1 ? `${years}+` : String(years),
  }),
);

const LINUX_SKILL_OPTIONS: FilterOption[] = VALID_SKILL_LEVELS.map(
  (skillLevel) => ({ value: skillLevel, label: formatEnum(skillLevel) }),
);

interface FilterSelectProps {
  table: Table<Member>;
  columnId: string;
  label: string;
  options: readonly FilterOption[];
  parseValue?: (value: string) => unknown;
}

function FilterSelect({
  table,
  columnId,
  label,
  options,
  parseValue = (value) => value,
}: FilterSelectProps) {
  const column = table.getColumn(columnId);
  const filterValue = column?.getFilterValue();
  const selectId = `${columnId}Filter`;

  return (
    <div>
      <label htmlFor={selectId} className={filterLabelClass}>
        {label}
      </label>

      <AdminSelect
        id={selectId}
        value={filterValue === undefined ? "" : String(filterValue)}
        onChange={(event) => {
          const value = event.target.value;
          column?.setFilterValue(value === "" ? undefined : parseValue(value));
        }}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </AdminSelect>
    </div>
  );
}

export default function MembersTable({ data }: MembersTableProps) {
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const columns = useMemo(() => createColumns(setMemberToDelete), []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const registrationYearOptions = useMemo<FilterOption[]>(
    () =>
      [...new Set(data.map((member) => member.registrationYear))]
        .sort((a, b) => b - a)
        .map((year) => ({ value: String(year), label: String(year) })),
    [data],
  );

  const yearFilter = table.getColumn("registrationYear")?.getFilterValue() as
    | number
    | undefined;
  const uoaFilter = table.getColumn("isCurrentUoaStudent")?.getFilterValue() as
    | boolean
    | undefined;
  const rows = table.getRowModel().rows;

  return (
    <>
      <AdminPageHeader
        title="Members"
        count={describeCount(rows.length, uoaFilter, yearFilter)}
        description="Browse and manage registered members."
      />

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <FilterSelect
          table={table}
          columnId="registrationYear"
          label="Year"
          options={registrationYearOptions}
          parseValue={Number}
        />

        <FilterSelect
          table={table}
          columnId="isCurrentUoaStudent"
          label="UoA student"
          options={UOA_STUDENT_OPTIONS}
          parseValue={(value) => value === "true"}
        />

        <FilterSelect
          table={table}
          columnId="faculty"
          label="Faculty"
          options={FACULTY_OPTIONS}
        />

        <FilterSelect
          table={table}
          columnId="programmeType"
          label="Programme type"
          options={PROGRAMME_TYPE_OPTIONS}
        />

        <FilterSelect
          table={table}
          columnId="yearsRemaining"
          label="Years remaining"
          options={YEARS_REMAINING_OPTIONS}
          parseValue={Number}
        />

        <FilterSelect
          table={table}
          columnId="linuxSkillLevel"
          label="Linux skill"
          options={LINUX_SKILL_OPTIONS}
        />
      </div>

      <div className={`mt-6 ${adminTableWrapClass}`}>
        {/* min-w-max keeps each member on one line; the wrapper scrolls sideways. */}
        <table className="w-full min-w-max border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className={`${adminThClass} ${pinnedColumns[header.column.id] ?? ""}`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr className="border-t border-[var(--divider)]">
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-[var(--muted)]"
                >
                  No members match these filters.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className={adminRowClass}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`${adminTdClass} ${pinnedColumns[cell.column.id] ?? ""}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={memberToDelete !== null}
        title={
          memberToDelete
            ? `Delete ${memberToDelete.firstName} ${memberToDelete.lastName}?`
            : "Delete member?"
        }
        confirmLabel="Delete member"
        pendingLabel="Deleting…"
        onClose={() => setMemberToDelete(null)}
        onConfirm={async () => {
          if (!memberToDelete) return;
          // Redirects back to this page on success; only failures come back as a result.
          const result = await deleteMemberAction(memberToDelete.id);
          return result ? deleteErrorMessages[result.error] : undefined;
        }}
      >
        {memberToDelete && (
          <>
            <p>
              This permanently removes their {memberToDelete.registrationYear}{" "}
              registration. This can&apos;t be undone.
            </p>
            {/* Plain text with an icon, not a box, so it can't be mistaken for an input. */}
            <p className="mt-3 flex items-center gap-2 font-mono text-sm break-all text-[var(--fg)]">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 shrink-0 text-[var(--muted)]"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              {memberToDelete.email}
            </p>
          </>
        )}
      </ConfirmDialog>
    </>
  );
}
