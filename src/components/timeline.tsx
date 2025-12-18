import { AlertCircle, BarChart3, CheckCircle2, FileText } from "lucide-react";

import type { TimelineItem } from "@/types/ops";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

function iconFor(type: TimelineItem["type"]) {
  switch (type) {
    case "alert":
      return AlertCircle;
    case "log":
      return FileText;
    case "metric":
      return BarChart3;
    case "action":
      return CheckCircle2;
  }
}

function badgeVariantFor(type: TimelineItem["type"]) {
  switch (type) {
    case "alert":
      return "warning";
    case "log":
      return "secondary";
    case "metric":
      return "outline";
    case "action":
      return "success";
  }
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  const sorted = [...items].sort((a, b) => (a.t > b.t ? 1 : -1));
  return (
    <div className="space-y-3">
      {sorted.map((it, idx) => {
        const Icon = iconFor(it.type);
        const isLast = idx === sorted.length - 1;
        return (
          <div key={`${it.t}-${it.label}`} className="relative flex gap-3">
            <div className="flex flex-col items-center">
              <div className="grid size-9 place-items-center rounded-md border bg-card">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              {!isLast ? (
                <div className="my-1 h-full w-px bg-border" aria-hidden />
              ) : null}
            </div>
            <div className={cn("min-w-0 flex-1 rounded-lg border bg-card p-3")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex-1 truncate text-sm font-medium">
                  {it.label}
                </div>
                <Badge variant={badgeVariantFor(it.type)}>{it.type}</Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{it.t}</div>
              {it.meta ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(it.meta).slice(0, 6).map(([k, v]) => (
                    <Badge key={k} variant="secondary">
                      {k}: {String(v)}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}


