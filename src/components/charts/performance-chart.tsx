"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ZPoint } from "@/lib/zabbix-metrics";

export function PerformanceChart({ data }: { data: ZPoint[] }) {
  return (
    <div className="h-56 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 6, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" opacity={0.18} />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 11 }}
            minTickGap={28}
            tickFormatter={(v) => String(v).slice(11, 16)}
          />
          <YAxis tick={{ fontSize: 11 }} width={34} />
          <Tooltip
            formatter={(v: number, name: string) => [v.toFixed(2), name]}
            labelFormatter={(l) => String(l).replace("T", " ").slice(0, 16)}
          />
          <Line
            type="monotone"
            dataKey="valuesProcessed"
            stroke="#f2c94c"
            strokeWidth={2}
            dot={false}
            name="Values processed/s"
          />
          <Line
            type="monotone"
            dataKey="queue"
            stroke="#eb5757"
            strokeWidth={2}
            dot={false}
            name="Queue (10m)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


