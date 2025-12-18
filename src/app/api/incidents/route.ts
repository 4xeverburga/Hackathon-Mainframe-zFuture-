import { NextRequest } from "next/server";

import { INCIDENTS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const list = INCIDENTS.filter((i) => (status ? i.status === status : true));
  return Response.json(list);
}


