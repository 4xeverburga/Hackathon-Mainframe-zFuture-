export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);

  // Demo: en un backend real, aquí persistirías la acción y la asociarías al incidente.
  // Devolvemos OK para permitir el "registro de acciones" en UI.
  return Response.json({ ok: true, incidentId: id, received: body });
}


