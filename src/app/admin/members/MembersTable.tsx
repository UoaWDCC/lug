"use client";

import { useMemo } from "react";
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

import { columns } from "./columns";
import { formatEnum } from "./utils";

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
    // The highest option also covers anyone with more years remaining.
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
  // Converts the selected option value into the column's filter value.
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
      <label
        htmlFor={selectId}
        className="mr-2 text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <select
        id={selectId}
        value={filterValue === undefined ? "" : String(filterValue)}
        onChange={(event) => {
          const value = event.target.value;

          column?.setFilterValue(value === "" ? undefined : parseValue(value));
        }}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

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

  const registrationYearOptions = useMemo<FilterOption[]>(
    () =>
      [...new Set(data.map((member) => member.registrationYear))]
        .sort((a, b) => b - a)
        .map((year) => ({ value: String(year), label: String(year) })),
    [data],
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-4">
        <FilterSelect
          table={table}
          columnId="registrationYear"
          label="Registration year"
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
