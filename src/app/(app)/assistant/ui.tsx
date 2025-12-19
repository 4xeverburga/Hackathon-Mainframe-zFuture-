"use client";

import * as React from "react";
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  CornerDownLeft,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type Role = "user" | "assistant";

type TopologyRow = {
  lpar: string;
  mq: string;
  db2: string;
  ims: string;
  cics: string;
};

type CriticalEventRow = {
  name: string;
  resource: string;
  time: string;
};

type IncidentRow = {
  id: string;
  title: string;
  priority: string;
  status: string;
  description: string;
  resolution: string;
};

type IncidentDraft = {
  title: string;
  description: string;
  urgency: "1 - High" | "2 - Medium" | "3 - Low";
  impact: "1 - High" | "2 - Medium" | "3 - Low";
  assignedTo: string;
};

type AssistantAttachment =
  | { kind: "topology"; systemName: string; summary: string; rows: TopologyRow[] }
  | { kind: "critical_events"; title: string; rows: CriticalEventRow[] }
  | { kind: "wlm_summary"; title: string; text: string }
  | { kind: "historical_incidents"; title: string; rows: IncidentRow[] }
  | { kind: "incident_form"; title: string; draft: IncidentDraft }
  | { kind: "incident_created"; title: string; incidentId: string; assignedTo: string };

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  at: string;
  attachments?: AssistantAttachment[];
};

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function formatChatTime(iso: string) {
  if (!iso) return "";
  // Deterministic format to avoid hydration mismatches (no locale differences, fixed timezone).
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(iso));
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function hasAny(haystack: string, needles: string[]) {
  return needles.some((n) => haystack.includes(n));
}

const DEMO_SYSTEM = "MCMPLX1";

const DEMO_TOPOLOGY: TopologyRow[] = [
  {
    lpar: "TIVLP17",
    mq: "M91M",
    db2: "DC17, DCC7",
    ims: "",
    cics:
      "Plex - PLEX11, Regions - CICST11D, CICST11C, CICST11B, CICST11A, CICST17B, CICST17A; Plex - LP17, Regions - CMAS17A",
  },
  {
    lpar: "TIVLP11",
    mq: "M92C, M92B, M92A, M91L",
    db2: "DC11, DCC1",
    ims: "IF1A",
    cics: "Plex - LP11, Regions - CMAS11A",
  },
];

const DEMO_CRITICAL_EVENTS: CriticalEventRow[] = [
  {
    name: "Abnormal transaction_rate on CICS Region CMAS11A",
    resource: "CMAS11A",
    time: "March 05, 2025 02:18:01.000",
  },
  {
    name: "Abnormal transaction_rate on CICS Region CICST11A",
    resource: "CICST11A",
    time: "March 05, 2025 02:18:01.000",
  },
  {
    name: "Abnormal transaction_rate on CICS Region CICST11B",
    resource: "CICST11B",
    time: "March 05, 2025 02:18:01.000",
  },
];

const DEMO_HISTORICAL_INCIDENTS: IncidentRow[] = [
  {
    id: "INC0010219",
    title: "Abnormal Transaction Rate Detected on CICS Region CICS5AJB",
    priority: "5",
    status: "Resolved",
    description:
      "Se detectó un abnormal transaction rate en CICS Region CICS5AJB. Este issue puede indicar una posible degradación de performance o una anomalía subyacente del sistema.",
    resolution:
      "Se ajustó el transaction routing y se inició temporalmente un CICS region adicional, mejorando los response times (90% por debajo de 0.5s).",
  },
  {
    id: "INC0010291",
    title: "Abnormal transaction rate on CICS Region CICS3AAA",
    priority: "1",
    status: "New",
    description:
      "La Service class WLMAISC no cumplió su goal, con un performance index de 1.2. El execution velocity goal era 70%, pero solo se logró 58.08%.",
    resolution: "",
  },
  {
    id: "INC0010249",
    title: "Service class TRANSACT did not meet its goal for more than 30 minutes in CICS region",
    priority: "1",
    status: "Resolved",
    description:
      "Percentile response time goal de 90% por debajo de .5s, pero solo se logró 40% en el CICS region.",
    resolution:
      "Se inició temporalmente un CICS region adicional para distribuir carga; puede requerirse tuning adicional de WLM y uso de QR-TCB.",
  },
  {
    id: "INC0010276",
    title: "Abnormal transaction_rate on CICS Region CICS3AAA",
    priority: "1",
    status: "New",
    description:
      "La Service class WLMAISC no cumplió su goal, con un performance index de 1.2. El execution velocity goal era 70%, pero solo se logró 58.08%.",
    resolution: "",
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "assistant-welcome",
    role: "assistant",
    at: "",
    text: "watsonx Assistant for Z\nPregúntame sobre tu entorno z/OS, alerts e incidents.",
    attachments: [],
  },
];

function suggestedPrompts() {
  return [
    "Muéstrame la topology de systems en mi entorno z/OS",
    "Dame los critical events entre March 05 2025 y March 06 2025.",
    "Dame el summary para CICST11A",
    "¿Hay historical incidents relacionados con transaction rate issue para CICS?",
  ];
}

function buildAssistantReply(inputRaw: string, history: ChatMessage[]) {
  const input = normalize(inputRaw);
  const hasFormOpen = history.some((m) =>
    m.attachments?.some((a) => a.kind === "incident_form"),
  );
  const alreadyCreated = history.some((m) =>
    m.attachments?.some((a) => a.kind === "incident_created"),
  );

  // Confirmation flow for incident creation.
  if (hasFormOpen && !alreadyCreated && (input === "yes" || input === "y" || input === "si" || input === "sí")) {
    return {
      text: "Incident creado correctamente.\n\nResumen: El Incident fue creado y asignado. Puedes abrirlo desde el enlace de abajo.",
      attachments: [
        {
          kind: "incident_created",
          title: "Incident creado",
          incidentId: "INC0010306",
          assignedTo: "***********",
        } satisfies AssistantAttachment,
      ],
    };
  }

  if (hasFormOpen && !alreadyCreated && (input === "no" || input === "n")) {
    return {
      text: "Listo — no crearé el Incident. ¿Quieres que proponga pasos de mitigación o que recolecte más evidencia?",
      attachments: [],
    };
  }

  // Topology
  if (hasAny(input, ["topology", "topología", "topologia", "lpar", "systems in my zos", "z/os", "zos"])) {
    return {
      text: `System Name: ${DEMO_SYSTEM}\n\nSummary\nLa información de topology recuperada muestra la configuración de LPAR y la presencia de MQ, DB2, IMS y CICS en estos LPAR. No se encontraron errores ni datos faltantes durante el proceso.`,
      attachments: [
        {
          kind: "topology",
          systemName: DEMO_SYSTEM,
          summary:
            "Hay un total de 2 LPAR. De estos, 2 tienen MQ activo, 2 tienen DB2 activo, 1 tiene IMS activo y 2 tienen CICS activo.",
          rows: DEMO_TOPOLOGY,
        } satisfies AssistantAttachment,
      ],
    };
  }

  // Critical events between dates
  if (
    hasAny(input, ["critical events", "eventos críticos", "events between", "march 05", "march 06", "05 2025", "06 2025"])
  ) {
    return {
      text: "Estos son 3 critical events del sistema entre March 05, 2025 y March 06, 2025.",
      attachments: [
        {
          kind: "critical_events",
          title: "critical events",
          rows: DEMO_CRITICAL_EVENTS,
        } satisfies AssistantAttachment,
      ],
    };
  }

  // Summary for CICST11A / WLM
  if (hasAny(input, ["summary for", "wlm", "cicst11a", "goal attainment"])) {
    return {
      text: "Resumen de Workload Manager (WLM) goal attainment",
      attachments: [
        {
          kind: "wlm_summary",
          title: "WLM goal attainment",
          text:
            "La Service class NEWRTECH no cumplió su goal, con un performance index en None. El execution velocity goal era 500, pero solo se logró 50%. El Total delay percentage es 50%.",
        } satisfies AssistantAttachment,
      ],
    };
  }

  // Historical incidents
  if (
    hasAny(input, [
      "historical incidents",
      "incidents related",
      "historical",
      "transaction rate",
      "transaction_rate",
      "cics?",
    ])
  ) {
    return {
      text: "Incidents encontrados:",
      attachments: [
        {
          kind: "historical_incidents",
          title: "Incidents históricos (ServiceNow)",
          rows: DEMO_HISTORICAL_INCIDENTS,
        } satisfies AssistantAttachment,
      ],
    };
  }

  // Recommend opening an incident
  if (hasAny(input, ["create an incident", "create incident", "servicenow", "open an incident", "ticket"])) {
    const draft: IncidentDraft = {
      title: "Abnormal transaction_rate on CICS Region CICS3AAA",
      description:
        "La Service class WLMAISC no cumplió su goal, con un performance index de 1.2. El execution velocity goal era 70%, pero solo se logró 58.08%.",
      urgency: "1 - High",
      impact: "1 - High",
      assignedTo: "***********",
    };

    return {
      text: '¿Quieres crear un ServiceNow incident? Por favor confirma respondiendo con "Yes" o "No".',
      attachments: [
        { kind: "incident_form", title: "ServiceNow incident (borrador)", draft } satisfies AssistantAttachment,
      ],
    };
  }

  // Default fallback: guide user
  return {
    text:
      "Puedo ayudarte a revisar el estado operativo de IBM Z a través de agents.\n\nPrueba pidiendo topology, critical events entre fechas, un WLM summary o historical incidents.",
    attachments: [],
  };
}

function MessageBubble({ msg, onQuickReply }: { msg: ChatMessage; onQuickReply: (text: string) => void }) {
  const isUser = msg.role === "user";
  const timeLabel = formatChatTime(msg.at);
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[900px] rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground border-primary/20"
            : "bg-card text-foreground border-border",
        )}
      >
        <div className="whitespace-pre-wrap">{msg.text}</div>

        {msg.role === "assistant" && msg.attachments?.length ? (
          <div className="mt-3 space-y-3">
            {msg.attachments.map((a, idx) => (
              <Attachment key={`${msg.id}-${idx}`} a={a} onQuickReply={onQuickReply} />
            ))}
          </div>
        ) : null}

        {timeLabel ? (
          <div
            className={cn(
              "mt-2 text-[11px] opacity-70",
              isUser ? "text-primary-foreground/80" : "text-muted-foreground",
            )}
          >
            {timeLabel}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Attachment({
  a,
  onQuickReply,
}: {
  a: AssistantAttachment;
  onQuickReply: (text: string) => void;
}) {
  if (a.kind === "topology") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">LPAR Details</span>
            <Badge variant="outline">AI</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-muted-foreground">{a.summary}</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left text-xs text-muted-foreground">LPAR Name</th>
                  <th className="py-2 text-left text-xs text-muted-foreground">MQ</th>
                  <th className="py-2 text-left text-xs text-muted-foreground">DB2</th>
                  <th className="py-2 text-left text-xs text-muted-foreground">IMS</th>
                  <th className="py-2 text-left text-xs text-muted-foreground">CICS</th>
                </tr>
              </thead>
              <tbody>
                {a.rows.map((r) => (
                  <tr key={r.lpar} className="border-b last:border-0">
                    <td className="py-3 pr-4 align-top font-medium">{r.lpar}</td>
                    <td className="py-3 pr-4 align-top">{r.mq}</td>
                    <td className="py-3 pr-4 align-top">{r.db2}</td>
                    <td className="py-3 pr-4 align-top">{r.ims || "—"}</td>
                    <td className="py-3 pr-4 align-top">{r.cics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (a.kind === "critical_events") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-muted-foreground">{a.title}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left text-xs text-muted-foreground">Event name</th>
                <th className="py-2 text-left text-xs text-muted-foreground">Resource name</th>
                <th className="py-2 text-left text-xs text-muted-foreground">Event time</th>
              </tr>
            </thead>
            <tbody>
              {a.rows.map((r) => (
                <tr key={`${r.resource}-${r.name}`} className="border-b last:border-0">
                  <td className="py-3 pr-4 align-top">{r.name}</td>
                  <td className="py-3 pr-4 align-top font-medium">{r.resource}</td>
                  <td className="py-3 pr-4 align-top">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-xs text-muted-foreground">Mostrando top 3 de 1381</div>
        </CardContent>
      </Card>
    );
  }

  if (a.kind === "wlm_summary") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-muted-foreground">{a.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{a.text}</CardContent>
      </Card>
    );
  }

  if (a.kind === "historical_incidents") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-muted-foreground">{a.title}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left text-xs text-muted-foreground">Incident ID</th>
                <th className="py-2 text-left text-xs text-muted-foreground">Título</th>
                <th className="py-2 text-left text-xs text-muted-foreground">Prioridad</th>
                <th className="py-2 text-left text-xs text-muted-foreground">Estado</th>
                <th className="py-2 text-left text-xs text-muted-foreground">Descripción</th>
                <th className="py-2 text-left text-xs text-muted-foreground">Resolución</th>
              </tr>
            </thead>
            <tbody>
              {a.rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 align-top font-medium text-primary">{r.id}</td>
                  <td className="py-3 pr-4 align-top">{r.title}</td>
                  <td className="py-3 pr-4 align-top">{r.priority}</td>
                  <td className="py-3 pr-4 align-top">{r.status}</td>
                  <td className="py-3 pr-4 align-top text-muted-foreground">{r.description}</td>
                  <td className="py-3 pr-4 align-top text-muted-foreground">{r.resolution || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onQuickReply("Create a ServiceNow incident")} type="button">
              Crear ServiceNow incident <CornerDownLeft className="ml-2 size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (a.kind === "incident_form") {
    const d = a.draft;
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{a.title}</span>
            <Badge variant="secondary">IA</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Título" value={d.title} />
            <Field label="Asignado a" value={d.assignedTo} />
            <Field label="Urgency" value={d.urgency} />
            <Field label="Impact" value={d.impact} />
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="text-xs font-medium text-muted-foreground">Descripción</div>
            <div className="mt-1 text-muted-foreground">{d.description}</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => onQuickReply("Yes")} type="button">
              Yes, crear Incident <ArrowUpRight className="ml-2 size-4" />
            </Button>
            <Button variant="outline" onClick={() => onQuickReply("No")} type="button">
              No
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (a.kind === "incident_created") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span className="text-muted-foreground">{a.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm">
            Ver Incident: <span className="font-semibold text-primary">{a.incidentId}</span>
            <div className="mt-1 text-xs text-muted-foreground">
              Asignado a: <span className="text-foreground">{a.assignedTo}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuickReply(`Open ${a.incidentId}`)}
            type="button"
          >
            Abrir <ArrowUpRight className="ml-1 size-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

export function AssistantClient() {
  const [draft, setDraft] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => INITIAL_MESSAGES);

  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const send = React.useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", text: trimmed, at: nowIso() },
      ]);

      setDraft("");

      // Simulated agent routing latency.
      setTimeout(() => {
        setMessages((prev) => {
          const reply = buildAssistantReply(trimmed, prev);
          return [
            ...prev,
            {
              id: uid(),
              role: "assistant",
              text: reply.text,
              at: nowIso(),
              attachments: reply.attachments,
            },
          ];
        });
      }, 450);
    },
    [setMessages],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground">Agentic AI</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="text-2xl font-semibold tracking-tight">watsonx Assistant</div>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="size-3" /> AI
            </Badge>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Triage conversacional para IBM Z — topology, critical events y creación de Incident.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-2">
            <Bot className="size-4" /> Routed agents
          </Badge>
        </div>
      </div>

      <Card className="relative overflow-hidden">
        <CardContent className="p-0">
          <div className="flex h-[calc(100dvh-240px)] min-h-[520px] flex-col">
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-3">
                {messages.map((m) => (
                  <MessageBubble key={m.id} msg={m} onQuickReply={(t) => send(t)} />
                ))}
                <div ref={bottomRef} />
              </div>
            </div>

            <div className="border-t bg-background/80 p-3 backdrop-blur">
              <div className="mx-auto flex max-w-[980px] flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts().map((p) => (
                    <button
                      key={p}
                      type="button"
                      className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      onClick={() => send(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="flex items-end gap-2">
                  <div className="relative flex-1">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Escribe algo…"
                      className={cn(
                        "min-h-[44px] w-full resize-none rounded-xl border bg-background px-4 py-3 pr-12 text-sm outline-none",
                        "focus-visible:ring-2 focus-visible:ring-ring",
                      )}
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send(draft);
                        }
                      }}
                      aria-label="Message input"
                    />
                    <Button
                      type="button"
                      size="icon"
                      className="absolute bottom-2 right-2 size-8 rounded-lg"
                      onClick={() => send(draft)}
                      aria-label="Send"
                    >
                      <ArrowUpRight className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-center text-[11px] text-muted-foreground">
                  Enter para enviar • Shift+Enter para nueva línea • Flujo basado en el video de watsonx Assistant for Z
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


