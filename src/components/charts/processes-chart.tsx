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

export function ProcessesChart({ data }: { data: ZPoint[] }) {
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
            formatter={(value, name) => {
              const v =
                typeof value === "number"
                  ? value.toFixed(0)
                  : value == null
                    ? "—"
                    : String(value);
              return [v, String(name)];
            }}
            labelFormatter={(l) => String(l).replace("T", " ").slice(0, 16)}
          />
          <Line type="monotone" dataKey="procTotal" stroke="#f2c94c" strokeWidth={2} dot={false} name="Total" />
          <Line type="monotone" dataKey="procMonitoring" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Monitoring" />
          <Line type="monotone" dataKey="procMySQL" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="MySQL" />
          <Line type="monotone" dataKey="procOther" stroke="#9b51e0" strokeWidth={2} dot={false} name="Other" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


