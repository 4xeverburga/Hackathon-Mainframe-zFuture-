"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch: resolvedTheme is only reliable on the client.
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Cambiar tema"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
    >
      {/* Keep SSR/initial client render stable; swap after mount */}
      {mounted ? (isDark ? <Sun /> : <Moon />) : <Moon />}
    </Button>
  );
}


