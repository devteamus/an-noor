"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Use a stable label/icon until mounted to avoid hydration mismatch.
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="থিম পরিবর্তন করুন"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full h-9 w-9 sm:h-10 sm:w-10 cursor-pointer hover:bg-accent"
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        )
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] opacity-0" />
      )}
    </Button>
  );
}
