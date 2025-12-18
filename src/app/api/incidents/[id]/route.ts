import { INCIDENTS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const incident = INCIDENTS.find((i) => i.id === params.id);
  if (!incident) return new Response("Not found", { status: 404 });
  return Response.json(incident);
}


