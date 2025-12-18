export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const ticketId = `ITS-${Math.floor(100000 + Math.random() * 900000)}`;

  // Demo: en integración real, aquí iría ServiceNow/Jira/Remedy, etc.
  return Response.json({ ok: true, ticketId, received: body });
}


