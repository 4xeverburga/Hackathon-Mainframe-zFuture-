"use client";

import * as React from "react";
import { Download, ExternalLink, Flag, Siren, Ticket } from "lucide-react";

import { api } from "@/lib/api";
import type { Incident } from "@/types/ops";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeline } from "@/components/timeline";
import { RecommendationList } from "@/components/recommendation-list";
import { scoreToRiskLabel } from "@/lib/format";
import { FeedbackDialog, type FeedbackDialogState } from "@/components/feedback-dialog";

export function IncidentClient({ id }: { id: string }) {
  const [incident, setIncident] = React.useState<Incident | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [itsmTicket, setItsmTicket] = React.useState<string | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<FeedbackDialogState>({
    open: false,
    title: "",
    description: "",
  });

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadError(null);
    api
      .incident(id)
      .then((d) => {
        if (!mounted) return;
        setIncident(d);
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        const msg = e instanceof Error ? e.message : "Failed to load incident.";
        setLoadError(msg);
        setFeedback({
          open: true,
          title: "Failed to load incident",
          description: msg,
        });
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const risk = scoreToRiskLabel(incident?.riskScore ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground">War room</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="text-2xl font-semibold tracking-tight">
              {loading ? "Loading incident…" : `Incident ${incident?.id ?? id}`}
            </div>
            <Badge variant={risk.variant}>{risk.label}</Badge>
            {incident ? <Badge variant="outline">{incident.status}</Badge> : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Service:</span>
            <Badge variant="secondary">{incident?.service ?? "—"}</Badge>
            <span>ETA:</span>
            <Badge variant="outline">{incident?.etaMinutes ?? "—"}m</Badge>
            <span>Risk:</span>
            <Badge variant="outline">{incident?.riskScore ?? "—"}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              const res = await api.itsmTicket({
                incidentId: id,
                title: incident?.summary ?? "Incident",
                service: incident?.service,
              });
              setItsmTicket(res.ticketId);
              setFeedback({
                open: true,
                title: "ITSM ticket created",
                description: `Ticket: ${res.ticketId}`,
              });
            }}
            type="button"
          >
            <Ticket className="mr-2" />
            Create ITSM ticket
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const payload = {
                incidentId: id,
                exportedAt: new Date().toISOString(),
                summary: incident?.summary,
                timeline: incident?.timeline,
              };
              navigator.clipboard
                .writeText(JSON.stringify(payload, null, 2))
                .then(() =>
                  setFeedback({
                    open: true,
                    title: "Evidence exported",
                    description:
                      "A JSON payload was copied to the clipboard (paste into a ticket or chat).",
                  }),
                )
                .catch(() =>
                  setFeedback({
                    open: true,
                    title: "Failed to export evidence",
                    description:
                      "Your browser blocked clipboard access. Try HTTPS or copy manually.",
                  }),
                );
            }}
            type="button"
          >
            <Download className="mr-2" />
            Export evidence
          </Button>
          <Button
            onClick={async () => {
              await api.incidentAction(id, { action: "mark_mitigated", at: new Date().toISOString() });
              setFeedback({
                open: true,
                title: "Status updated",
                description: "Marked as mitigated (demo).",
              });
            }}
            type="button"
          >
            <Flag className="mr-2" />
            Mark mitigated
          </Button>
        </div>
      </div>

      {itsmTicket ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
            <div className="text-sm">
              ITSM ticket created: <span className="font-semibold">{itsmTicket}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFeedback({
                  open: true,
                  title: "Open ITSM (demo)",
                  description: "This would open the ticket in ServiceNow/Jira/Remedy, etc.",
                })
              }
              type="button"
            >
              Open <ExternalLink className="ml-1" />
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Summary</TabsTrigger>
          <TabsTrigger value="evidencia">Evidence</TabsTrigger>
          <TabsTrigger value="causa">Probable cause</TabsTrigger>
          <TabsTrigger value="recomendaciones">Recommendations</TabsTrigger>
          <TabsTrigger value="verificacion">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground">What is happening</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading || !incident ? (
                <>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-2/3" />
                </>
              ) : (
                <>
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                      <Siren className="size-4" /> Impact / scope
                    </div>
                    <div className="mt-1 text-muted-foreground">{incident.summary}</div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {incident.topDrivers.map((d) => (
                      <div key={d.name} className="rounded-lg border bg-card p-3">
                        <div className="text-xs text-muted-foreground">{d.name}</div>
                        <div className="mt-1 text-lg font-semibold">
                          {(d.weight * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidencia">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground">
                Correlated timeline (alerts + logs + metrics)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading || !incident ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <Timeline items={incident.timeline} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="causa">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground">Probable cause</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading || !incident ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : (
                incident.probableCauses.map((c, idx) => (
                  <div key={idx} className="rounded-lg border bg-card p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-medium">{c.cause}</div>
                      <Badge variant="outline">
                        Confianza {(c.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.evidence.map((e) => (
                        <Badge key={e} variant="secondary">
                          {e}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recomendaciones">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground">Prioritized actions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading || !incident ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <RecommendationList
                  items={incident.recommendations}
                  onRun={async (rec) => {
                    await api.incidentAction(id, {
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verificacion">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground">Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <div className="font-medium">Quick checklist (demo)</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>Interface errors return to baseline</li>
                  <li>CPU returns to expected level</li>
                  <li>p95 latency stabilizes</li>
                  <li>No new deduplicated alerts</li>
                </ul>
              </div>
              <div className="text-xs text-muted-foreground">
                (Hackathon) You can show before/after mini-charts per driver here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FeedbackDialog
        state={feedback}
        onOpenChange={(open) => setFeedback((s) => ({ ...s, open }))}
      />

      {loadError ? (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="text-sm font-semibold">Error loading incident</div>
          <div className="mt-1 text-sm text-muted-foreground">{loadError}</div>
          <div className="mt-3">
            <Button
              variant="outline"
              onClick={() => {
                setLoading(true);
                setIncident(null);
                setLoadError(null);
                api
                  .incident(id)
                  .then((d) => setIncident(d))
                  .catch((e: unknown) =>
                    setLoadError(e instanceof Error ? e.message : "Error"),
                  )
                  .finally(() => setLoading(false));
              }}
              type="button"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}


