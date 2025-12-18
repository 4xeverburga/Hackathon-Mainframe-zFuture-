import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-medium text-muted-foreground">Settings</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">
          Conectores y reglas
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-muted-foreground">Conectores</span>
              <Badge variant="secondary">Demo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Monitoreo (alerts), Syslog/SMF, métricas z/OS, DB, red. En producción aquí se
            configuran credenciales y pipelines.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-muted-foreground">Reglas</span>
              <Badge variant="secondary">Demo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Dedupe, correlación, umbrales, severidades, “quiet hours” y políticas
            de escalamiento.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


