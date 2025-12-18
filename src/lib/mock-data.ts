import type { Alert, Incident, Overview, Recommendation, Severity } from "@/types/ops";

const now = new Date("2025-12-17T19:12:00-05:00").getTime();
const iso = (ms: number) => new Date(ms).toISOString();

export const SERVICES = ["Core Payments", "Core Banking", "Batch", "Canales Digitales"] as const;

export const ALERTS: Alert[] = [
  {
    id: "a-10291",
    timestamp: "2025-12-17T19:10:00-05:00",
    source: "zabbix",
    service: "Core Payments",
    host: "z-host-01",
    severity: "high",
    title: "High CPU utilization",
    tag: ["cpu", "performance"],
    status: "open",
    dedupeKey: "z-host-01:cpu:high",
  },
  {
    id: "a-10285",
    timestamp: "2025-12-17T19:05:00-05:00",
    source: "zabbix",
    service: "Core Payments",
    host: "AXMDEBPISC15",
    severity: "high",
    title: "Interface 1/1x120: Link down",
    tag: ["network"],
    status: "open",
    dedupeKey: "AXMDEBPISC15:if:down",
  },
  {
    id: "a-10283",
    timestamp: "2025-12-17T19:02:00-05:00",
    source: "zabbix",
    service: "Core Payments",
    host: "AXMDEBPISC19",
    severity: "high",
    title: "Interface peth0(3): High error rate (>2 for 5m)",
    tag: ["network", "errors"],
    status: "open",
    dedupeKey: "AXMDEBPISC19:if:errorrate",
  },
  {
    id: "a-10270",
    timestamp: "2025-12-17T18:58:00-05:00",
    source: "zabbix",
    service: "Core Banking",
    host: "z-host-02",
    severity: "medium",
    title: "Getting closer to process limit",
    tag: ["capacity"],
    status: "open",
    dedupeKey: "z-host-02:proc:limit",
  },
  {
    id: "a-10260",
    timestamp: "2025-12-17T18:42:00-05:00",
    source: "zabbix",
    service: "Batch",
    host: "z-host-03",
    severity: "low",
    title: "Configured max number of processes is too low",
    tag: ["config"],
    status: "open",
    dedupeKey: "z-host-03:config:procs",
  },
  {
    id: "a-10210",
    timestamp: "2025-12-17T17:20:00-05:00",
    source: "zabbix",
    service: "Canales Digitales",
    host: "api-gw-01",
    severity: "medium",
    title: "Elevated 5xx rate",
    tag: ["http", "errors"],
    status: "open",
    dedupeKey: "api-gw-01:http:5xx",
  },
];

export const INCIDENTS: Incident[] = [
  {
    id: "inc-778",
    status: "active",
    service: "Core Payments",
    riskScore: 86,
    etaMinutes: 45,
    summary:
      "Riesgo alto de degradación por acumulación de eventos en CPU y errores de red.",
    topDrivers: [
      { name: "Network", weight: 0.42 },
      { name: "CPU", weight: 0.33 },
      { name: "I/O", weight: 0.25 },
    ],
    probableCauses: [
      {
        cause: "Microcortes de red elevan reintentos y presión de CPU",
        confidence: 0.78,
        evidence: ["Interface link down", "High error rate", "CPU spike + retries"],
      },
      {
        cause: "Colas de transacción crecen por latencia intermitente",
        confidence: 0.61,
        evidence: ["In/Out traffic jitter", "Retries correlated", "Response time drift"],
      },
    ],
    recommendations: [
      {
        id: "rec-1",
        title: "Escalar a equipo de red con evidencia correlacionada",
        impact: "Reduce riesgo en ~30%",
        effort: "Low",
        priority: 1,
      },
      {
        id: "rec-2",
        title: "Contener cargas no críticas durante ventana online",
        impact: "Reduce riesgo en ~20%",
        effort: "Medium",
        priority: 2,
      },
      {
        id: "rec-3",
        title: "Aumentar umbrales de pooling para mitigar reintentos",
        impact: "Mejora estabilidad transaccional (~10–15%)",
        effort: "Medium",
        priority: 3,
      },
    ],
    timeline: [
      {
        t: "2025-12-17T18:58:00-05:00",
        type: "metric",
        label: "Network jitter sube (p95)",
        meta: { p95Ms: 180 },
      },
      { t: "2025-12-17T19:02:00-05:00", type: "alert", label: "High error rate" },
      { t: "2025-12-17T19:05:00-05:00", type: "alert", label: "Interface link down" },
      { t: "2025-12-17T19:06:30-05:00", type: "log", label: "Retry storm detected" },
      { t: "2025-12-17T19:10:00-05:00", type: "alert", label: "High CPU utilization" },
      {
        t: "2025-12-17T19:11:15-05:00",
        type: "metric",
        label: "CPU retries correlated (+0.81)",
      },
    ],
  },
  {
    id: "inc-771",
    status: "mitigated",
    service: "Canales Digitales",
    riskScore: 52,
    etaMinutes: 0,
    summary: "Degradación parcial por picos de 5xx en API Gateway; mitigado por rate limiting.",
    topDrivers: [
      { name: "CPU", weight: 0.25 },
      { name: "Network", weight: 0.15 },
      { name: "I/O", weight: 0.10 },
    ],
    probableCauses: [
      {
        cause: "Burst de tráfico + backend lento provoca timeouts",
        confidence: 0.66,
        evidence: ["5xx increased", "Latency spike", "Timeout logs"],
      },
    ],
    recommendations: [
      {
        id: "rec-9",
        title: "Ajustar límites de rate limiting por ruta crítica",
        impact: "Reduce 5xx durante picos",
        effort: "Low",
        priority: 1,
      },
    ],
    timeline: [
      { t: "2025-12-17T17:20:00-05:00", type: "alert", label: "Elevated 5xx rate" },
      { t: "2025-12-17T17:25:00-05:00", type: "action", label: "Rate limiting aplicado" },
      { t: "2025-12-17T17:32:00-05:00", type: "metric", label: "5xx vuelve a baseline" },
    ],
  },
];

export function buildRiskSeries(hours: number) {
  const points: { t: string; risk: number }[] = [];
  for (let i = hours; i >= 0; i--) {
    const t = now - i * 5 * 60 * 1000; // every 5 min
    const base = 22 + Math.sin(i / 3) * 6;
    const spike = i < 8 ? (8 - i) * 7 : 0;
    const noise = (i % 4) * 1.3;
    const risk = Math.max(0, Math.min(100, Math.round(base + spike + noise)));
    points.push({ t: iso(t), risk });
  }
  return points;
}

export function severityRank(sev: Severity) {
  return { low: 1, medium: 2, high: 3, critical: 4 }[sev];
}

export function getOverview(service = "Core Payments", window: Overview["window"] = "1h"): Overview {
  const riskSeries = buildRiskSeries(window === "1h" ? 12 : window === "6h" ? 72 : window === "24h" ? 288 : 500);
  const topDrivers = INCIDENTS[0]?.topDrivers ?? [
    { name: "CPU", weight: 0.33 },
    { name: "Network", weight: 0.33 },
    { name: "I/O", weight: 0.34 },
  ];

  const activeIncidents = INCIDENTS.filter((i) => i.status === "active").map((i) => ({
    id: i.id,
    status: i.status,
    service: i.service,
    riskScore: i.riskScore,
    etaMinutes: i.etaMinutes,
    summary: i.summary,
  }));

  const topActions: Recommendation[] = (INCIDENTS.find((i) => i.status === "active")?.recommendations ?? []).slice(0, 3);

  return {
    window,
    service,
    availability24h: 99.93,
    riskScoreNow: riskSeries.at(-1)?.risk ?? 32,
    criticalToday: { p1: 1, p2: 2 },
    avoided7d: 7,
    riskSeries,
    topDrivers,
    activeIncidents,
    topActions,
  };
}


