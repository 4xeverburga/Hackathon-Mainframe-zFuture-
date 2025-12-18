import { NextRequest } from "next/server";

import { ALERTS, severityRank } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const severity = searchParams.get("severity");
  const service = searchParams.get("service");
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  const filtered = ALERTS.filter((a) => {
    if (severity && a.severity !== severity) return false;
    if (service && a.service !== service) return false;
    if (q) {
      const hay = `${a.title} ${a.host} ${a.service} ${a.tag.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => severityRank(b.severity) - severityRank(a.severity));

  return Response.json(filtered);
}


