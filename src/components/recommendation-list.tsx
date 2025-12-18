"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

import type { Recommendation } from "@/types/ops";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RecommendationList({
  items,
  onRun,
}: {
  items: Recommendation[];
  onRun?: (rec: Recommendation) => Promise<void> | void;
}) {
  return (
    <div className="space-y-3">
      {items.map((r) => (
        <Card key={r.id} className="hover:border-muted-foreground/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-md bg-primary/15 text-primary">
                    <Sparkles className="size-4" />
                  </div>
                  <div className="min-w-0 truncate text-sm font-semibold">
                    {r.title}
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Impacto: {r.impact}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">P{r.priority}</Badge>
                <Badge variant="secondary">Effort: {r.effort}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRun?.(r)}
              type="button"
            >
              Registrar acción
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


