import Link from "next/link";
import { ArrowRight, Timer } from "lucide-react";

import type { Incident } from "@/types/ops";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scoreToRiskLabel } from "@/lib/format";

export function IncidentCard({
  incident,
}: {
  incident: Pick<
    Incident,
    "id" | "status" | "service" | "riskScore" | "etaMinutes" | "summary"
  >;
}) {
  const risk = scoreToRiskLabel(incident.riskScore);
  return (
    <Card className="hover:border-muted-foreground/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{incident.service}</div>
            <div className="mt-1 text-xs text-muted-foreground">{incident.id}</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={risk.variant}>{risk.label}</Badge>
            <Badge variant="outline">{incident.status}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-foreground/90">{incident.summary}</div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Timer className="size-4" />
            ETA impacto: <span className="text-foreground">{incident.etaMinutes}m</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/incidents/${incident.id}`}>
              Ver detalle <ArrowRight className="ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


