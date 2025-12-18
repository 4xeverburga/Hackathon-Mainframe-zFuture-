"use client";

import * as React from "react";
import Link from "next/link";
import { Filter, Search, Sparkles } from "lucide-react";

import { api } from "@/lib/api";
import type { Alert, Incident } from "@/types/ops";
import { AlertRow } from "@/components/alert-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendationList } from "@/components/recommendation-list";
import { scoreToRiskLabel } from "@/lib/format";
import { FeedbackDialog, type FeedbackDialogState } from "@/components/feedback-dialog";

const SEVERITIES = ["all", "critical", "high", "medium", "low"] as const;
const SERVICES = ["all", "Core Payments", "Core Banking", "Batch", "Canales Digitales"] as const;

export function TriageClient() {
  const [severity, setSeverity] = React.useState<(typeof SEVERITIES)[number]>("all");
  const [service, setService] = React.useState<(typeof SERVICES)[number]>("all");
  const [q, setQ] = React.useState("");
  const [alerts, setAlerts] = React.useState<Alert[]>([]);
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<FeedbackDialogState>({
    open: false,
    title: "",
    description: "",
  });

  const selected = React.useMemo(
    () => alerts.find((a) => a.id === selectedId) ?? null,
    [alerts, selectedId],
  );

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      api.alerts({
        severity: severity === "all" ? undefined : severity,
        service: service === "all" ? undefined : service,
        q: q.trim() ? q.trim() : undefined,
      }),
      api.incidents({ status: "active" }),
    ])
      .then(([a, inc]) => {
        if (!mounted) return;
        setAlerts(a);
        setIncidents(inc);
        if (!selectedId && a[0]) setSelectedId(a[0].id);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [severity, service, q, selectedId]);

  const correlated = React.useMemo(() => {
    if (!selected) return null;
    return incidents.find((i) => i.service === selected.service) ?? null;
  }, [incidents, selected]);

  const risk = scoreToRiskLabel(correlated?.riskScore ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-medium text-muted-foreground">Operations view</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">Alert triage</div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-muted-foreground">Alert feed</span>
              <Badge variant="warning">LIVE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Filter className="size-4" /> Filters
              </div>
              <select
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as typeof severity)}
                aria-label="Filter by severity"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={service}
                onChange={(e) => setService(e.target.value as typeof service)}
                aria-label="Filter by service"
              >
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search host, tag, or title…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search alerts"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {loading ? (
                <>
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </>
              ) : alerts.length === 0 ? (
                <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                  No alerts for those filters.
                </div>
              ) : (
                alerts.map((a) => (
                  <AlertRow
                    key={a.id}
                    alert={a}
                    selected={a.id === selectedId}
                    onClick={() => setSelectedId(a.id)}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground">
                Correlation summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!selected ? (
                <div className="text-sm text-muted-foreground">Select an alert.</div>
              ) : correlated ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{correlated.service}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{correlated.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={risk.variant}>{risk.label}</Badge>
                      <Badge variant="outline">{correlated.status}</Badge>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                    <div className="font-medium">Likely impact</div>
                    <div className="mt-1 text-muted-foreground">{correlated.summary}</div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Impact ETA</span>
                    <span className="text-foreground">{correlated.etaMinutes}m</span>
                  </div>

                  <Button asChild>
                    <Link href={`/incidents/${correlated.id}`}>Open war room</Link>
                  </Button>
                </>
              ) : (
                <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                  <div className="font-medium text-foreground">Not correlated</div>
                  <div className="mt-1">
                    This alert is not grouped into an incident yet. Keep monitoring or
                    create one manually.
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="outline">State: New</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() =>
                        setFeedback({
                          open: true,
                          title: "Create incident (demo)",
                          description:
                            "In a real version, this would create an incident and apply correlation/dedupe automatically.",
                        })
                      }
                    >
                      Create incident
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {correlated ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="size-4" /> What to do next
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecommendationList
                  items={correlated.recommendations.slice(0, 3)}
                  onRun={async (rec) => {
                    await api.incidentAction(correlated.id, {
                      recommendationId: rec.id,
                      title: rec.title,
                      at: new Date().toISOString(),
                    });
                    setFeedback({
                      open: true,
                      title: "Action logged",
                      description: rec.title,
                    });
                  }}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <FeedbackDialog
        state={feedback}
        onOpenChange={(open) => setFeedback((s) => ({ ...s, open }))}
      />
    </div>
  );
}


