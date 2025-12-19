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

export function CpuMultilineChart({ data }: { data: ZPoint[] }) {
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
          <YAxis tick={{ fontSize: 11 }} width={34} domain={[0, 60]} />
          <Tooltip
            formatter={(value, name) => {
              const v =
                typeof value === "number"
                  ? value.toFixed(1)
                  : value == null
                    ? "—"
                    : String(value);
              return [v, String(name)];
            }}
            labelFormatter={(l) => String(l).replace("T", " ").slice(0, 16)}
          />
          <Line type="monotone" dataKey="cpuUser" stroke="#f2c94c" strokeWidth={2} dot={false} name="CPU user" />
          <Line type="monotone" dataKey="cpuSystem" stroke="#eb5757" strokeWidth={2} dot={false} name="CPU system" />
          <Line type="monotone" dataKey="cpuIowait" stroke="#2f80ed" strokeWidth={2} dot={false} name="CPU iowait" />
          <Line type="monotone" dataKey="cpuSteal" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="CPU steal" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


