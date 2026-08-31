"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { Member } from "@/generated/prisma/client";

import { columns } from "./columns";

interface MembersTableProps {
  data: Member[];
}

export default function MembersTable({ data }: MembersTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnVisibility: {
        isConditionalReturningMember: false,
      },
    },
  });

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <label
            htmlFor="yearsRemaining"
            className="mr-2 text-sm font-medium text-gray-700"
          >
            Years remaining
          </label>

          <select
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
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5+</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="uoaStatus"
            className="mr-2 text-sm font-medium text-gray-700"
          >
            UoA student
          </label>

          <select
            id="uoaStatus"
            value={
              (table.getColumn("isCurrentUoaStudent")?.getFilterValue() as
                | boolean
                | undefined) === true
                ? "true"
                : (table.getColumn("isCurrentUoaStudent")?.getFilterValue() as
                      | boolean
                      | undefined) === false
                  ? "false"
                  : ""
            }
            onChange={(event) => {
              const value = event.target.value;

              table
                .getColumn("isCurrentUoaStudent")
                ?.setFilterValue(value === "" ? undefined : value === "true");
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="returningStatus"
            className="mr-2 text-sm font-medium text-gray-700"
          >
            Member status
          </label>

          <select
            id="returningStatus"
            value={
              (table
                .getColumn("isConditionalReturningMember")
                ?.getFilterValue() as boolean | undefined) === true
                ? "returning"
                : (table
                      .getColumn("isConditionalReturningMember")
                      ?.getFilterValue() as boolean | undefined) === false
                  ? "new"
                  : ""
            }
            onChange={(event) => {
              const value = event.target.value;

              table
                .getColumn("isConditionalReturningMember")
                ?.setFilterValue(
                  value === "" ? undefined : value === "returning",
                );
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="returning">Returning</option>
            <option value="new">New</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 font-medium">
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
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2">
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
