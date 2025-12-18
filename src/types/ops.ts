export type Severity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "open" | "ack" | "resolved";

export type IncidentStatus = "new" | "investigating" | "mitigated" | "closed" | "active";

export type Alert = {
  id: string;
  timestamp: string;
  source: "zabbix" | "syslog" | "smf" | "custom";
  service: string;
  host: string;
  severity: Severity;
  title: string;
  tag: string[];
  status: AlertStatus;
  dedupeKey: string;
};

export type TopDriver = { name: string; weight: number };

export type ProbableCause = {
  cause: string;
  confidence: number;
  evidence: string[];
};

export type Recommendation = {
  id: string;
  title: string;
  impact: string;
  effort: "Low" | "Medium" | "High";
  priority: number;
};

export type TimelineItem = {
  t: string;
  type: "alert" | "log" | "metric" | "action";
  label: string;
  meta?: Record<string, string | number | boolean>;
};

export type Incident = {
  id: string;
  status: "active" | "mitigated" | "closed";
  service: string;
  riskScore: number;
  etaMinutes: number;
  summary: string;
  topDrivers: TopDriver[];
  probableCauses: ProbableCause[];
  recommendations: Recommendation[];
  timeline: TimelineItem[];
};

export type Overview = {
  window: "1h" | "6h" | "24h" | "7d";
  service: string;
  availability24h: number;
  riskScoreNow: number;
  criticalToday: { p1: number; p2: number };
  avoided7d: number;
  riskSeries: { t: string; risk: number }[];
  topDrivers: TopDriver[];
  activeIncidents: Pick<Incident, "id" | "status" | "service" | "riskScore" | "etaMinutes" | "summary">[];
  topActions: Recommendation[];
};


