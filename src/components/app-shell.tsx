import Link from "next/link";
import Image from "next/image";
import { Activity, AlertTriangle, Bot, FileBarChart2, ServerCog, Users } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/assistant", label: "Assistant", icon: Bot },
  { href: "/triage", label: "Triage", icon: AlertTriangle },
  { href: "/reports", label: "Reports", icon: FileBarChart2 },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: ServerCog },
];

export function AppShell({
  children,
  activePath,
}: {
  children: React.ReactNode;
  activePath: string;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-0 md:grid-cols-[260px_1fr]">
        <aside className="hidden border-r bg-card/30 md:block">
          <div className="flex h-dvh flex-col">
            <div className="flex items-center gap-3 px-5 py-5">
              <div className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
                <Image
                  src="/images (10).png"
                  alt="Interbank"
                  width={40}
                  height={40}
                  priority
                  unoptimized
                />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Ops Command Center</div>
                <div className="text-xs text-muted-foreground">
                  Interbank • IBM Z
                </div>
              </div>
            </div>

            {/* Make continuity more visible (not pinned to bottom) */}
            <div className="px-4 pb-2">
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold">Continuity</div>
                  <Badge variant="success">Stable</Badge>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Risk</div>
                    <div className="text-xl font-semibold tabular-nums">32</div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/reports">View reports</Link>
                  </Button>
                </div>
              </div>
            </div>

            <nav className="px-3">
              <div className="px-2 pb-2 text-xs font-medium text-muted-foreground">Navigation</div>
              <div className="space-y-1">
                {nav.map((item) => {
                  const Icon = item.icon;
                  const active =
                    activePath === item.href ||
                    (item.href !== "/" && activePath.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.href === "/triage" ? (
                        <Badge variant="warning">LIVE</Badge>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="mt-auto px-4 pb-4">
              <div className="rounded-lg border bg-card/40 p-3">
                <div className="text-xs font-medium text-muted-foreground">Tips</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Use <span className="text-foreground">Triage</span> to act with evidence.
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-h-dvh">
          <header className="sticky top-0 z-10 border-b bg-background/70 backdrop-blur">
            <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 md:px-6">
              <div className="md:hidden">
                <div className="flex items-center gap-2">
                  <div className="grid size-7 place-items-center overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10">
                    <Image
                      src="/images (10).png"
                      alt="Interbank"
                      width={28}
                      height={28}
                      unoptimized
                    />
                  </div>
                  <Badge variant="outline">Ops</Badge>
                </div>
              </div>

              <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="text-sm font-semibold">Operational Continuity</div>
                <Badge variant="secondary">Core Payments</Badge>
                <Badge variant="outline">Window: 1h</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" asChild className="hidden sm:inline-flex">
                  <Link href="/incidents/inc-778">Incidente demo</Link>
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1400px] p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}


