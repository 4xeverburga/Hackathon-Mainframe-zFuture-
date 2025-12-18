"use client";

import * as React from "react";
import { ArrowRight, ShieldCheck, Siren, TrendingUp } from "lucide-react";
import Link from "next/link";

import { api } from "@/lib/api";
import type { Overview } from "@/types/ops";
import { KpiCard } from "@/components/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IncidentCard } from "@/components/incident-card";
import { RiskLineChart } from "@/components/charts/risk-line-chart";
import { TopDrivers } from "@/components/top-drivers";
import { formatPct, scoreToRiskLabel } from "@/lib/format";

const SERVICES = ["Core Payments", "Core Banking", "Batch", "Canales Digitales"];
const WINDOWS = ["1h", "6h", "24h", "7d"] as const;

export function DashboardClient() {
  const [service, setService] = React.useState<string>("Core Payments");
  const [window, setWindow] = React.useState<(typeof WINDOWS)[number]>("1h");
  const [data, setData] = React.useState<Overview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Vista ejecutiva
          </div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">
            Estado de continuidad
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-muted-foreground">Servicio</label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={service}
            onChange={(e) => setService(e.target.value)}
            aria-label="Seleccionar servicio"
          >
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label className="ml-2 text-xs text-muted-foreground">Ventana</label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={window}
            onChange={(e) => setWindow(e.target.value as (typeof WINDOWS)[number])}
            aria-label="Seleccionar ventana de tiempo"
          >
            {WINDOWS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <KpiCard
          title="Availability (24h)"
          value={loading ? <Skeleton className="h-7 w-24" /> : formatPct(data?.availability24h ?? 0)}
          right={<ShieldCheck className="size-4 text-muted-foreground" />}
          sub="Meta: 99.90%"
        />
        <KpiCard
          title="Risk Score (now)"
          value={
            loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <span>{data?.riskScoreNow ?? "-"}</span>
                <Badge variant={risk.variant}>{risk.label}</Badge>
              </div>
            )
          }
          right={<TrendingUp className="size-4 text-muted-foreground" />}
          sub="0–100"
        />
        <KpiCard
          title="Incidentes críticos hoy"
          value={
            loading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <span>
                P1 {data?.criticalToday.p1 ?? 0} / P2 {data?.criticalToday.p2 ?? 0}
              </span>
            )
          }
          right={<Siren className="size-4 text-muted-foreground" />}
          sub="Prioridad operativa"
        />
        <KpiCard
          title="Incidentes evitados (7d)"
          value={loading ? <Skeleton className="h-7 w-16" /> : data?.avoided7d ?? 0}
          right={<ShieldCheck className="size-4 text-muted-foreground" />}
          sub="Estimación (IA + reglas)"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground">Riesgo vs tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !data ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <RiskLineChart data={data.riskSeries} />
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {loading || !data ? <Skeleton className="h-[260px] w-full" /> : <TopDrivers drivers={data.topDrivers} />}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground">
                Acciones recomendadas (Top 3)
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
                  <div key={a.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
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
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
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
              data.activeIncidents.map((inc) => (
                <IncidentCard key={inc.id} incident={inc} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground">Mensaje ejecutivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <div className="font-medium">Qué está pasando</div>
              <div className="mt-1 text-muted-foreground">
                La plataforma consolida alertas + métricas + logs para priorizar riesgo y
                sugerir acciones con evidencia. El foco es prevenir degradaciones antes
                de que impacten al core.
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/triage">Ir a triage</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/reports">Ver reportes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


