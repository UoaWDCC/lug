"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useState } from "react";

import type { Member } from "@/generated/prisma/client";

import { columns } from "./columns";

import { exportColumns, exportMembers } from "./exportMembers";

interface MembersTableProps {
  data: Member[];
}

export default function MembersTable({ data }: MembersTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedColumnIds, setSelectedColumnIds] = useState<string[]>(() =>
    exportColumns.map((column) => column.id),
  );

  const toggleColumn = (id: string, checked: boolean) => {
    setSelectedColumnIds((current) =>
      checked
        ? [...current, id]
        : current.filter((columnId) => columnId !== id),
    );
  };

  const handleExport = () => {
    const selectedColumns = exportColumns.filter((column) =>
      selectedColumnIds.includes(column.id),
    );

    if (selectedColumns.length === 0) return;

    const members = table.getFilteredRowModel().rows.map((row) => row.original);

    exportMembers(members, selectedColumns);
    setIsExportOpen(false);
  };

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

        <button
          type="button"
          onClick={() => {
            setIsExportOpen(true);
          }}
          disabled={table.getFilteredRowModel().rows.length === 0}
          className="self-end rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          Export CSV
        </button>
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

      {isExportOpen && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsExportOpen(false);
            }
          }}
        >
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Export CSV</h2>

            <p className="mb-3 text-sm text-gray-600">
              Select the columns you want to export:
            </p>

            {/* <div className="mb-4 flex flex-col items-start gap-2 text-sm">
              <button
                type="button"
                onClick={() =>
                  setSelectedColumnIds(
                    exportColumns.map((column) => column.id),
                  )
                }
                className="text-blue-700 underline hover:text-blue-900 cursor-pointer"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => setSelectedColumnIds([])}
                className="text-blue-700 underline hover:text-blue-900 cursor-pointer"
              >
                Clear all
              </button>
            </div> */}

            <div className="grid grid-flow-col grid-rows-8 gap-3 sm:grid-rows-8">
              {exportColumns.map((column) => (
                <label
                  key={column.id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumnIds.includes(column.id)}
                    onChange={(event) =>
                      toggleColumn(column.id, event.target.checked)
                    }
                    className="size-4 accent-blue-700 cursor-pointer"
                  />
                  {column.header}
                </label>
              ))}
            </div>

            <div className="flex justify-between">
              <div className="mt-4 flex flex-col items-start gap-1 text-sm">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedColumnIds(
                      exportColumns.map((column) => column.id),
                    )
                  }
                  className="text-blue-700 underline hover:text-blue-900 cursor-pointer"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedColumnIds([])}
                  className="text-blue-700 underline hover:text-blue-900 cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="mt-6 flex flex-end justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsExportOpen(false)}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  disabled={selectedColumnIds.length === 0}
                  className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
