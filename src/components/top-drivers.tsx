import type { TopDriver } from "@/types/ops";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export function TopDrivers({ drivers }: { drivers: TopDriver[] }) {
  const max = Math.max(0.0001, ...drivers.map((d) => d.weight));
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-muted-foreground">Top drivers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {drivers.map((d) => (
          <div key={d.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="font-medium">{d.name}</div>
              <div className="text-xs text-muted-foreground">
                {(d.weight * 100).toFixed(0)}%
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className={cn("h-2 rounded-full bg-primary/70")}
                style={{ width: `${(d.weight / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


