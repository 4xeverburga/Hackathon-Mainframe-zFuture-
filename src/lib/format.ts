import type { Severity } from "@/types/ops";

export function formatPct(v: number) {
  return `${v.toFixed(2)}%`;
}

export function severityToBadgeVariant(sev: Severity) {
  switch (sev) {
    case "critical":
      return "danger";
    case "high":
      return "warning";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
  }
}

export function severityLabel(sev: Severity) {
  switch (sev) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
  }
}

export function scoreToRiskLabel(score: number) {
  if (score >= 80) return { label: "High", variant: "danger" as const };
  if (score >= 60) return { label: "Elevated", variant: "warning" as const };
  if (score >= 35) return { label: "Watch", variant: "secondary" as const };
  return { label: "Stable", variant: "success" as const };
}


