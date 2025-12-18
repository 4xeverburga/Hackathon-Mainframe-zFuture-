"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/reports/sparkline";
import { formatPct } from "@/lib/format";

type Row = {
  service: string;
  availability: number;
  incidents: number;
  mttaMin: number;
  mttrMin: number;
  trend: number[];
};

const rows: Row[] = [
  {
    service: "Core Payments",
    availability: 99.93,
    incidents: 3,
    mttaMin: 6,
    mttrMin: 28,
    trend: [99.95, 99.92, 99.90, 99.93, 99.94, 99.93],
  },
  {
    service: "Core Banking",
    availability: 99.97,
    incidents: 1,
    mttaMin: 9,
    mttrMin: 40,
    trend: [99.98, 99.97, 99.96, 99.97, 99.98, 99.97],
  },
  {
    service: "Batch",
    availability: 99.89,
    incidents: 2,
    mttaMin: 12,
    mttrMin: 55,
    trend: [99.92, 99.90, 99.88, 99.87, 99.89, 99.89],
  },
  {
    service: "Canales Digitales",
    availability: 99.91,
    incidents: 4,
    mttaMin: 5,
    mttrMin: 22,
    trend: [99.90, 99.88, 99.91, 99.92, 99.91, 99.91],
  },
];

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "service",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        type="button"
      >
        Servicio <ArrowUpDown className="ml-2" />
      </Button>
    ),
    cell: (info) => <div className="font-medium">{String(info.getValue())}</div>,
  },
  {
    accessorKey: "availability",
    header: "Availability (24h)",
    cell: (info) => formatPct(Number(info.getValue())),
  },
  { accessorKey: "incidents", header: "Incidentes (7d)" },
  { accessorKey: "mttaMin", header: "MTTA (min)" },
  { accessorKey: "mttrMin", header: "MTTR (min)" },
  {
    accessorKey: "trend",
    header: "Trend",
    cell: (info) => <Sparkline values={info.getValue() as number[]} />,
    enableSorting: false,
  },
];

export function AvailabilityTable() {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "availability", desc: false },
  ]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-muted-foreground">
          Availability por servicio
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b">
                {hg.headers.map((h) => (
                  <th key={h.id} className="py-2 text-left text-xs text-muted-foreground">
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                {r.getVisibleCells().map((c) => (
                  <td key={c.id} className="py-3 pr-4 align-middle">
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}


