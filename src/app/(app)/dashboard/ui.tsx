"use client";

import * as React from "react";
import { ArrowRight, Database, HardDrive, Network, Server, Timer } from "lucide-react";
import Link from "next/link";

import { api } from "@/lib/api";
import type { Overview } from "@/types/ops";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IncidentCard } from "@/components/incident-card";
import { cn } from "@/lib/cn";
import { formatPct, scoreToRiskLabel } from "@/lib/format";
import { buildSeries, buildSessionBuckets } from "@/lib/zabbix-metrics";
import { CpuMultilineChart } from "@/components/charts/cpu-multiline-chart";
import { TrafficAreaChart } from "@/components/charts/traffic-area-chart";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { ProcessesChart } from "@/components/charts/processes-chart";
import { MySqlOpsChart } from "@/components/charts/mysql-ops-chart";
import { SessionsMirroredChart } from "@/components/charts/sessions-mirrored-chart";

const SERVICES = ["Core Payments", "Core Banking", "Batch", "Canales Digitales"];
const WINDOWS = ["1h", "6h", "24h", "7d"] as const;

function Tile({
  title,
  value,
  sub,
  tone,
}: {
  title: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone: "green" | "amber" | "red" | "blue";
}) {
  // Stronger "alert tile" colors like the reference dashboard (optimized for dark mode).
  const toneClass =
    tone === "green"
      ? "bg-emerald-500/40 border-emerald-300/40"
      : tone === "amber"
        ? "bg-amber-500/38 border-amber-300/40"
        : tone === "red"
          ? "bg-rose-500/38 border-rose-300/40"
          : "bg-sky-500/35 border-sky-300/40";

  return (
    <div
      className={cn(
        "rounded-lg border p-4 h-[112px] flex flex-col justify-between overflow-hidden min-w-0",
        toneClass,
      )}
    >
      <div className="text-xs font-medium text-foreground/80 dark:text-white/80">
        {title}
      </div>
      <div className="text-xl md:text-2xl font-semibold tracking-tight text-foreground dark:text-white leading-tight">
        {value}
      </div>
      {sub ? (
        <div className="text-xs text-foreground/75 dark:text-white/70">{sub}</div>
      ) : (
        <div className="text-xs text-transparent">.</div>
      )}
    </div>
  );
}

function TagBar({
  items,
}: {
  items: Array<{ label: string; variant?: React.ComponentProps<typeof Badge>["variant"] }>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((it) => (
        <Badge key={it.label} variant={it.variant ?? "secondary"} className="whitespace-normal">
          {it.label}
        </Badge>
      ))}
    </div>
  );
}

export function DashboardClient() {
  const [service, setService] = React.useState<string>("Core Payments");
  const [window, setWindow] = React.useState<(typeof WINDOWS)[number]>("1h");
  const [data, setData] = React.useState<Overview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const zabbixSeries = React.useMemo(() => {
    const points = window === "1h" ? 60 : window === "6h" ? 120 : window === "24h" ? 240 : 420;
    const stepMs = window === "1h" ? 60_000 : window === "6h" ? 3 * 60_000 : window === "24h" ? 6 * 60_000 : 12 * 60_000;
    return buildSeries({ points, stepMs, seed: service.length * 7 });
  }, [service, window]);

  const sessionBuckets = React.useMemo(() => buildSessionBuckets(), []);
  const last = zabbixSeries.at(-1);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    api
      .overview({ service, window })
      .then((d) => {
        if (!mounted) return;
        setData(d);
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Error");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [service, window]);

  const risk = scoreToRiskLabel(data?.riskScoreNow ?? 0);
  const continuityTone: "green" | "amber" | "red" | "blue" =
    (data?.riskScoreNow ?? 0) >= 80 ? "red" : (data?.riskScoreNow ?? 0) >= 60 ? "amber" : "green";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground">Dashboard</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">
            Ops Command Center
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-muted-foreground">Service</label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={service}
            onChange={(e) => setService(e.target.value)}
            aria-label="Select service"
          >
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label className="ml-2 text-xs text-muted-foreground">Window</label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={window}
            onChange={(e) => setWindow(e.target.value as (typeof WINDOWS)[number])}
            aria-label="Select time window"
          >
            {WINDOWS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>

          <Button variant="outline" asChild className="ml-2">
            <Link href="/triage">Go to triage</Link>
          </Button>
        </div>
      </div>

      <TagBar
        items={[
          { label: `Interbank • ${service}`, variant: "outline" },
          { label: "IBM Z / z/OS", variant: "secondary" },
          { label: "LPAR: Z-CORE-01", variant: "secondary" },
          { label: `Window: ${window}`, variant: "secondary" },
        ]}
      />

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : null}

      {/* Row 1: Top tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          title="IBM Z — Observability"
          value="LPAR Z-CORE-01"
          sub="z/OS • Consolidated telemetry"
          tone="blue"
        />

        <Tile
          title="Capacity"
          value="CPU 2 • RAM 16 GB"
          sub="Disk 120 GB"
          tone="amber"
        />

        <Tile
          title="Continuity"
          value={
            loading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <span className="tabular-nums">
                {risk.label} • {data?.riskScoreNow}
              </span>
            )
          }
          sub={
            loading ? (
              "Availability (24h): —"
            ) : (
              <span className="tabular-nums">
                Availability (24h): {formatPct(data?.availability24h ?? 0)}
              </span>
            )
          }
          tone={continuityTone}
        />

        <Tile
          title="System signals"
          value={
            <span className="tabular-nums">
              Up 5w • Free 30%
            </span>
          }
          sub={
            <span className="tabular-nums">
              Load {loading ? "—" : Number(((data?.riskScoreNow ?? 0) / 2000).toFixed(2))} •
              Traffic {last ? `${last.trafficIn.toFixed(1)}/${last.trafficOut.toFixed(1)}` : "—"} MB/s
            </span>
          }
          tone="green"
        />
      </div>

      {/* Row 2: CPU / Performance / Traffic */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Server className="size-4" /> CPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CpuMultilineChart data={zabbixSeries} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Timer className="size-4" /> Server performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={zabbixSeries} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Network className="size-4" /> Traffic In/Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrafficAreaChart data={zabbixSeries} />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Sessions / Processes / MySQL */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Card className="xl:col-span-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground">Sessions /s</CardTitle>
          </CardHeader>
          <CardContent>
            <SessionsMirroredChart data={sessionBuckets} />
          </CardContent>
        </Card>
        <Card className="xl:col-span-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Server className="size-4" /> Processes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProcessesChart data={zabbixSeries} />
          </CardContent>
        </Card>
        <Card className="xl:col-span-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Database className="size-4" /> MySQL operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MySqlOpsChart data={zabbixSeries} />
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Keep Ops context (incidents + recommended actions) */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground">Incidentes activos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading || !data ? (
              <div className="space-y-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            ) : data.activeIncidents.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No hay incidentes activos. Mantener monitoreo.
              </div>
            ) : (
              data.activeIncidents.map((inc) => <IncidentCard key={inc.id} incident={inc} />)
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Acciones recomendadas (Top 3)</span>
              <Badge variant="secondary">IA</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading || !data ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : data.topActions.length === 0 ? (
              <div className="text-sm text-muted-foreground">Sin acciones sugeridas.</div>
            ) : (
              data.topActions.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-2 rounded-md border bg-card p-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.impact}</div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/triage">
                      Ver <ArrowRight className="ml-1" />
                    </Link>
                  </Button>
                </div>
              ))
            )}

            <div className="mt-3 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <HardDrive className="size-4" /> Availability (24h):{" "}
                <span className="text-foreground">
                  {loading ? "—" : formatPct(data?.availability24h ?? 0)}
                </span>
              </div>
              <div className="mt-1">
                Críticos hoy:{" "}
                <span className="text-foreground">
                  P1 {loading ? "—" : data?.criticalToday.p1} / P2{" "}
                  {loading ? "—" : data?.criticalToday.p2}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


