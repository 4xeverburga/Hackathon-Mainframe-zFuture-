"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ZPoint } from "@/lib/zabbix-metrics";

export function TrafficAreaChart({ data }: { data: ZPoint[] }) {
  return (
    <div className="h-56 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 6, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" opacity={0.18} />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 11 }}
            minTickGap={28}
            tickFormatter={(v) => String(v).slice(11, 16)}
          />
          <YAxis tick={{ fontSize: 11 }} width={34} />
          <Tooltip
            formatter={(v: number, name: string) => [`${v.toFixed(1)} MB/s`, name]}
            labelFormatter={(l) => String(l).replace("T", " ").slice(0, 16)}
          />
          <Area
            type="monotone"
            dataKey="trafficIn"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.25}
            name="In"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="trafficOut"
            stroke="hsl(var(--accent))"
            fill="hsl(var(--accent))"
            fillOpacity={0.20}
            name="Out"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}


