"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { Member } from "@/generated/prisma/client";
import {
  adminPinnedClass,
  adminRowClass,
  adminTableWrapClass,
  adminTdClass,
  adminThClass,
} from "@/app/admin/_components/adminStyles";

import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { AdminSelect } from "@/app/admin/_components/AdminSelect";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import deleteMemberAction from "@/features/admin-members/deleteMemberAction";

import { createColumns } from "./columns";

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

export default function MembersTable({ data }: MembersTableProps) {
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const columns = useMemo(() => createColumns(setMemberToDelete), []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const years = [
    ...new Set(data.map((member) => member.registrationYear)),
  ].sort((a, b) => b - a);

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
        <div>
          <label htmlFor="registrationYear" className={filterLabelClass}>
            Year
          </label>

          <AdminSelect
            id="registrationYear"
            value={yearFilter ?? ""}
            onChange={(event) => {
              const value = event.target.value;

              table
                .getColumn("registrationYear")
                ?.setFilterValue(value === "" ? undefined : Number(value));
            }}
          >
            <option value="">All</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </AdminSelect>
        </div>

        <div>
          <label htmlFor="uoaStatus" className={filterLabelClass}>
            UoA student
          </label>

          <AdminSelect
            id="uoaStatus"
            value={
              uoaFilter === true ? "true" : uoaFilter === false ? "false" : ""
            }
            onChange={(event) => {
              const value = event.target.value;

              table
                .getColumn("isCurrentUoaStudent")
                ?.setFilterValue(value === "" ? undefined : value === "true");
            }}
          >
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </AdminSelect>
        </div>

        <div>
          <label htmlFor="yearsRemaining" className={filterLabelClass}>
            Years remaining
          </label>

          <AdminSelect
            id="yearsRemaining"
            value={
              (table.getColumn("yearsRemaining")?.getFilterValue() as
                | number
                | undefined) ?? ""
            }
            onChange={(event) => {
              const value = event.target.value;

              table
                .getColumn("yearsRemaining")
                ?.setFilterValue(value === "" ? undefined : Number(value));
            }}
          >
            <option value="">All</option>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5+</option>
          </AdminSelect>
        </div>
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
