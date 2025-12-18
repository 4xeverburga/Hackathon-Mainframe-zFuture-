import Link from "next/link";
import { Activity, AlertTriangle, FileBarChart2, ServerCog } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/triage", label: "Triage", icon: AlertTriangle },
  { href: "/reports", label: "Reportes", icon: FileBarChart2 },
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
              <div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                <Activity className="size-5" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Ops Command Center</div>
                <div className="text-xs text-muted-foreground">
                  Interbank • IBM Z
                </div>
              </div>
            </div>

            <nav className="px-3">
              <div className="px-2 pb-2 text-xs font-medium text-muted-foreground">
                Navegación
              </div>
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

            <div className="mt-auto p-4">
              <div className="rounded-lg border bg-card p-3">
                <div className="text-xs font-medium">Continuidad</div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-sm font-semibold">Riesgo: 32</div>
                  <Badge variant="success">Stable</Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/reports">Ver reportes</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-h-dvh">
          <header className="sticky top-0 z-10 border-b bg-background/70 backdrop-blur">
            <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 md:px-6">
              <div className="md:hidden">
                <Badge variant="outline">Ops</Badge>
              </div>

              <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="text-sm font-semibold">
                  Continuidad Operacional
                </div>
                <Badge variant="secondary">Core Payments</Badge>
                <Badge variant="outline">Ventana: 1h</Badge>
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


