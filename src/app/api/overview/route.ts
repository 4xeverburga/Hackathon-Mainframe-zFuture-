import { NextRequest } from "next/server";

import { getOverview } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const service = searchParams.get("service") ?? undefined;
  const window = (searchParams.get("window") ?? "1h") as
    | "1h"
    | "6h"
    | "24h"
    | "7d";

  return Response.json(getOverview(service, window));
}


