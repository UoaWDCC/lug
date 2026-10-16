"use client";

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

import { AdminSelect } from "@/app/admin/_components/AdminSelect";

import { columns } from "./columns";

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
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Members
        </h1>
        <p className="font-mono text-lg text-[var(--muted)]" aria-live="polite">
          {describeCount(rows.length, uoaFilter, yearFilter)}
        </p>
      </div>
      <p className="mt-2 text-lg text-[var(--muted)]">
        Browse and manage registered members.
      </p>

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
    </>
  );
}
