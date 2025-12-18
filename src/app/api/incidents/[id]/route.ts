import { INCIDENTS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const incident = INCIDENTS.find((i) => i.id === id);
  if (!incident) return new Response("Not found", { status: 404 });
  return Response.json(incident);
}


