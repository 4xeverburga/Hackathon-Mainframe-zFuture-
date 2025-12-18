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

export function RiskLineChart({ data }: { data: { t: string; risk: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 6, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" opacity={0.25} />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => String(v).slice(11, 16)}
            minTickGap={24}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={30} />
          <Tooltip
            formatter={(v) => [`${v}`, "Risk"]}
            labelFormatter={(l) => `t: ${String(l).replace("T", " ").slice(0, 16)}`}
          />
          <Line
            type="monotone"
            dataKey="risk"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


