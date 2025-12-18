import type { Alert, Incident, Overview } from "@/types/ops";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { cache: "no-store", ...init });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export const api = {
  overview: (params?: { service?: string; window?: string }) => {
    const qs = new URLSearchParams();
    if (params?.service) qs.set("service", params.service);
    if (params?.window) qs.set("window", params.window);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return apiFetch<Overview>(`/api/overview${suffix}`);
  },
  alerts: (params?: { severity?: string; service?: string; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.severity) qs.set("severity", params.severity);
    if (params?.service) qs.set("service", params.service);
    if (params?.q) qs.set("q", params.q);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return apiFetch<Alert[]>(`/api/alerts${suffix}`);
  },
  incidents: (params?: { status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return apiFetch<Incident[]>(`/api/incidents${suffix}`);
  },
  incident: (id: string) => apiFetch<Incident>(`/api/incidents/${id}`),
  incidentAction: (id: string, body: unknown) =>
    apiFetch<{ ok: true }>(`/api/incidents/${id}/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  itsmTicket: (body: unknown) =>
    apiFetch<{ ok: true; ticketId: string }>(`/api/itsm/ticket`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
};


