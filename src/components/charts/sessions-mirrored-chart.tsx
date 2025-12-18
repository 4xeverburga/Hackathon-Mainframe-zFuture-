"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function SessionsMirroredChart({
  data,
}: {
  data: { bucket: string; left: number; right: number }[];
}) {
  return (
    <div className="h-56 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 6, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" opacity={0.18} />
          <XAxis dataKey="bucket" tick={{ fontSize: 11 }} interval={1} />
          <YAxis tick={{ fontSize: 11 }} width={34} />
          <ReferenceLine y={0} stroke="hsl(var(--border))" />
          <Tooltip
            formatter={(value?: number, name?: string) => {
              const v = typeof value === "number" ? value : 0;
              const label = name === "left" ? "A" : "B";
              return [Math.abs(v), label];
            }}
          />
          <Bar dataKey="left" fill="hsl(var(--primary))" name="left" />
          <Bar dataKey="right" fill="hsl(var(--accent))" name="right" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


