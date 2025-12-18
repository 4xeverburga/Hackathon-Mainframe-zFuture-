import { AvailabilityTable } from "@/components/reports/availability-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-medium text-muted-foreground">Reportes</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">
          Continuidad y eficiencia
        </div>
      </div>

      <AvailabilityTable />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground">
              Tendencia de incidentes (placeholder)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Aquí puedes graficar incidentes por severidad por día/semana (Recharts).
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground">
              MTTA / MTTR (placeholder)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Métricas de detección y recuperación para mostrar mejora del NOC/SRE.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


