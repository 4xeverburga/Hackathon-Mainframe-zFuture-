import { Cpu, Globe, HardDrive, ShieldAlert } from "lucide-react";

import type { Alert } from "@/types/ops";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { severityLabel, severityToBadgeVariant } from "@/lib/format";

function AlertIcon({ tag }: { tag: Alert["tag"] }) {
  const tags = new Set(tag);
  if (tags.has("network")) return <Globe className="size-4 text-muted-foreground" />;
  if (tags.has("cpu")) return <Cpu className="size-4 text-muted-foreground" />;
  if (tags.has("io")) return <HardDrive className="size-4 text-muted-foreground" />;
  return <ShieldAlert className="size-4 text-muted-foreground" />;
}

export function AlertRow({
  alert,
  selected,
  onClick,
}: {
  alert: Alert;
  selected?: boolean;
  onClick?: () => void;
}) {
  const sevVariant = severityToBadgeVariant(alert.severity);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border px-3 py-3 text-left transition-colors",
        selected ? "border-muted-foreground/40 bg-muted/50" : "hover:bg-muted/40",
      )}
      aria-label={`Alerta ${alert.title}`}
    >
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-muted">
          <AlertIcon tag={alert.tag} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-sm font-medium">{alert.title}</div>
            <Badge variant={sevVariant}>{severityLabel(alert.severity)}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="truncate">{alert.service}</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="truncate">{alert.host}</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="uppercase">{alert.source}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {alert.tag.slice(0, 4).map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
            {alert.tag.length > 4 ? (
              <Badge variant="outline">+{alert.tag.length - 4}</Badge>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}


