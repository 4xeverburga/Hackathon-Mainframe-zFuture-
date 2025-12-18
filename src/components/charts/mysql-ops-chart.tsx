"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ZPoint } from "@/lib/zabbix-metrics";

export function MySqlOpsChart({ data }: { data: ZPoint[] }) {
  return (
    <div className="h-56 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.slice(-30)} margin={{ left: 6, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" opacity={0.18} />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 11 }}
            minTickGap={28}
            tickFormatter={(v) => String(v).slice(11, 16)}
          />
          <YAxis tick={{ fontSize: 11 }} width={34} />
          <Tooltip
            formatter={(v: number, name: string) => [v.toFixed(0), name]}
            labelFormatter={(l) => String(l).replace("T", " ").slice(0, 16)}
          />
          <Bar dataKey="mysqlSelect" stackId="a" fill="#2f80ed" name="Select" />
          <Bar dataKey="mysqlInsert" stackId="a" fill="hsl(var(--primary))" name="Insert" />
          <Bar dataKey="mysqlUpdate" stackId="a" fill="#f2c94c" name="Update" />
          <Bar dataKey="mysqlDelete" stackId="a" fill="#eb5757" name="Delete" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


