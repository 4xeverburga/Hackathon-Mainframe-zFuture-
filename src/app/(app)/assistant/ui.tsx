"use client";

import * as React from "react";
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  CircleHelp,
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
      "An abnormal transaction rate has been detected on CICS Region CICS5AJB. This issue may indicate potential performance degradation or an underlying system anomaly.",
    resolution:
      "Transaction routing was adjusted and an additional CICS region was temporarily started, improving response times (90% under 0.5s).",
  },
  {
    id: "INC0010291",
    title: "Abnormal transaction rate on CICS Region CICS3AAA",
    priority: "1",
    status: "New",
    description:
      "The service class WLMAISC did not meet its goal, with a performance index of 1.2. The execution velocity goal was 70%, but only 58.08% was achieved.",
    resolution: "",
  },
  {
    id: "INC0010249",
    title: "Service class TRANSACT did not meet its goal for more than 30 minutes in CICS region",
    priority: "1",
    status: "Resolved",
    description:
      "Percentile response time goal of 90% under .5s but only 40% achieved in the CICS region.",
    resolution:
      "A temporary additional CICS region was started to distribute load; further tuning of WLM and QR-TCB usage may be required.",
  },
  {
    id: "INC0010276",
    title: "Abnormal transaction_rate on CICS Region CICS3AAA",
    priority: "1",
    status: "New",
    description:
      "The service class WLMAISC did not meet its goal, with a performance index of 1.2. The execution velocity goal was 70%, but only 58.08% was achieved.",
    resolution: "",
  },
];

function suggestedPrompts() {
  return [
    "Show me the topology of systems in my zOS environment",
    "Get me critical events between March 05 2025 and March 06 2025.",
    "Get me summary for CICST11A",
    "Are there any historical incidents related to transaction rate issue for CICS?",
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
      text: "Incident Created Successfully.\n\nSummary: The incident has been created and assigned. You can open it from the link below.",
      attachments: [
        {
          kind: "incident_created",
          title: "Incident created",
          incidentId: "INC0010306",
          assignedTo: "***********",
        } satisfies AssistantAttachment,
      ],
    };
  }

  if (hasFormOpen && !alreadyCreated && (input === "no" || input === "n")) {
    return {
      text: "Okay — I won’t create an incident. Want me to propose mitigation steps or collect more evidence?",
      attachments: [],
    };
  }

  // Topology
  if (hasAny(input, ["topology", "topología", "topologia", "lpar", "systems in my zos", "z/os", "zos"])) {
    return {
      text: `System Name: ${DEMO_SYSTEM}\n\nSummary\nThe topology data retrieved provides insights into the system's LPAR configuration and the presence of MQ, DB2, IMS, and CICS within these LPARs. No errors or missing data were encountered during the retrieval process.`,
      attachments: [
        {
          kind: "topology",
          systemName: DEMO_SYSTEM,
          summary:
            "There are a total of 2 LPARs. Out of these, 2 have MQ active, 2 have DB2 active, 1 has IMS active, and 2 have CICS active.",
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
      text: "These are 3 critical events from the system between March 05, 2025 and March 06, 2025.",
      attachments: [
        {
          kind: "critical_events",
          title: "Critical events",
          rows: DEMO_CRITICAL_EVENTS,
        } satisfies AssistantAttachment,
      ],
    };
  }

  // Summary for CICST11A / WLM
  if (hasAny(input, ["summary for", "wlm", "cicst11a", "goal attainment"])) {
    return {
      text: "Summary of Workload Manager (WLM) goal attainment",
      attachments: [
        {
          kind: "wlm_summary",
          title: "WLM goal attainment",
          text:
            "Service class NEWRTECH did not meet its goal, with a performance index set at None. The execution velocity goal was 500, but only 50% was achieved. Total delay percentage is 50%.",
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
      text: "Found Incidents:",
      attachments: [
        {
          kind: "historical_incidents",
          title: "Historical incidents (ServiceNow)",
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
        "The service class WLMAISC did not meet its goal, with a performance index of 1.2. The execution velocity goal was 70%, but only 58.08% was achieved.",
      urgency: "1 - High",
      impact: "1 - High",
      assignedTo: "***********",
    };

    return {
      text: 'Would you like to create a ServiceNow incident? Please confirm by responding with a "Yes" or "No".',
      attachments: [
        { kind: "incident_form", title: "ServiceNow incident (draft)", draft } satisfies AssistantAttachment,
      ],
    };
  }

  // Default fallback: guide user
  return {
    text:
      "I can help you inspect IBM Z operational status via agents (demo).\n\nTry asking for topology, critical events between dates, a WLM summary, or historical incidents.",
    attachments: [],
  };
}

function MessageBubble({ msg, onQuickReply }: { msg: ChatMessage; onQuickReply: (text: string) => void }) {
  const isUser = msg.role === "user";
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

        <div className={cn("mt-2 text-[11px] opacity-70", isUser ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {new Date(msg.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
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
          <div className="mt-2 text-xs text-muted-foreground">Showing top 3 of 1381</div>
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
                <th className="py-2 text-left text-xs text-muted-foreground">Title</th>
                <th className="py-2 text-left text-xs text-muted-foreground">Priority</th>
                <th className="py-2 text-left text-xs text-muted-foreground">Status</th>
                <th className="py-2 text-left text-xs text-muted-foreground">Description</th>
                <th className="py-2 text-left text-xs text-muted-foreground">Resolution</th>
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
              Create ServiceNow incident <CornerDownLeft className="ml-2 size-4" />
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
            <Badge variant="secondary">AI</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Title" value={d.title} />
            <Field label="Assigned to" value={d.assignedTo} />
            <Field label="Urgency" value={d.urgency} />
            <Field label="Impact" value={d.impact} />
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="text-xs font-medium text-muted-foreground">Description</div>
            <div className="mt-1 text-muted-foreground">{d.description}</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => onQuickReply("Yes")} type="button">
              Yes, create incident <ArrowUpRight className="ml-2 size-4" />
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
            View Incident: <span className="font-semibold text-primary">{a.incidentId}</span>
            <div className="mt-1 text-xs text-muted-foreground">
              Assigned to: <span className="text-foreground">{a.assignedTo}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuickReply(`Open ${a.incidentId}`)}
            type="button"
          >
            Open <ArrowUpRight className="ml-1 size-4" />
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
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => [
    {
      id: uid(),
      role: "assistant",
      at: nowIso(),
      text: "watsonx Assistant for Z\nAsk me about your z/OS environment, alerts, and incidents.",
      attachments: [],
    },
  ]);

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
            Conversational triage for IBM Z — topology, critical events, and incident creation.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-2">
            <Bot className="size-4" /> Routed agents
          </Badge>
          <Badge variant="outline" className="gap-2">
            <CircleHelp className="size-4" /> Demo data
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
                      placeholder="Type something…"
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
                  Enter to send • Shift+Enter for newline • Flow based on the watsonx Assistant for Z video
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


