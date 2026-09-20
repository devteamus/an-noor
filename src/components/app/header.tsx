"use client";

import * as React from "react";
import { useAppStore } from "@/lib/store";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Home,
  History,
  BookOpen,
  LayoutDashboard,
  Menu,
  Heart,
  Volume2,
  Shield,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "home", label: "হোম", icon: Home },
  { key: "names-of-allah", label: "৯৯ নাম", icon: Volume2 },
  { key: "ruqyah", label: "রুকইয়াহ", icon: Shield },
  { key: "namaz", label: "নামাজ", icon: Clock },
  { key: "blog", label: "ব্লগ", icon: BookOpen },
  { key: "shop", label: "বই", icon: ShoppingBag },
  { key: "history", label: "ইতিহাস", icon: History },
] as const;

export function AppHeader() {
  const view = useAppStore((s) => s.view);
  const goHome = useAppStore((s) => s.goHome);
  const goHistory = useAppStore((s) => s.goHistory);
  const goBlog = useAppStore((s) => s.goBlog);
  const goShop = useAppStore((s) => s.goShop);
  const goNamesOfAllah = useAppStore((s) => s.goNamesOfAllah);
  const goRuqyah = useAppStore((s) => s.goRuqyah);
  const goNamaz = useAppStore((s) => s.goNamaz);
  const goAdminLogin = useAppStore((s) => s.goAdminLogin);
  const goAdminDashboard = useAppStore((s) => s.goAdminDashboard);
  const [open, setOpen] = React.useState(false);

  const isActive = (key: string) => view.name === key;

  const handleNav = (key: string) => {
    if (key === "home") goHome();
    else if (key === "names-of-allah") goNamesOfAllah();
    else if (key === "ruqyah") goRuqyah();
    else if (key === "namaz") goNamaz();
    else if (key === "blog") goBlog();
    else if (key === "shop") goShop();
    else if (key === "history") goHistory();
  };

  const go = (fn: () => void) => () => {
    fn();
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
        {/* Logo */}
        <button
          onClick={goHome}
          className="flex items-center gap-2.5 cursor-pointer group"
          aria-label="হোমে যান"
        >
          <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 transition-transform group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18" />
              <path d="M5 21V11a7 7 0 0 1 14 0v10" />
              <path d="M12 3v3" />
              <circle cx="12" cy="14" r="1.5" fill="currentColor" />
            </svg>
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="font-bengali text-base font-bold tracking-tight text-foreground sm:text-lg">
              আন-নূর
            </span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">
              দুআ কাউন্টার ও ইসলামিক ব্লগ
            </span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.key);
            return (
              <Button
                key={item.key}
                variant={active ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleNav(item.key)}
                className={cn(
                  "gap-1 cursor-pointer rounded-full font-bengali text-xs",
                  active && "bg-accent"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">{item.label}</span>
              </Button>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={goAdminLogin}
            className="gap-1.5 cursor-pointer rounded-full font-bengali"
            aria-label="অ্যাডমিন"
          >
            <LayoutDashboard className="h-4 w-4" />
            অ্যাডমিন
          </Button>
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full cursor-pointer"
                aria-label="মেনু"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="px-5 pt-5 pb-3">
                <SheetTitle className="font-bengali text-left text-lg">
                  মেনু
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-3">
                <MobileNavItem
                  icon={Home}
                  label="হোম"
                  desc="দুআ কাউন্টার"
                  active={isActive("home")}
                  onClick={go(goHome)}
                />
                <MobileNavItem
                  icon={Volume2}
                  label="আল্লাহর ৯৯ নাম"
                  desc="অডিও সহ আসমাউল হুসনা"
                  active={isActive("names-of-allah")}
                  onClick={go(goNamesOfAllah)}
                />
                <MobileNavItem
                  icon={Shield}
                  label="রুকইয়াহ"
                  desc="রিজিক, বদনজর, যাদু চিকিৎসা"
                  active={isActive("ruqyah")}
                  onClick={go(goRuqyah)}
                />
                <MobileNavItem
                  icon={Clock}
                  label="পাঁচ ওয়াক্ত নামাজ"
                  desc="পড়ার নিয়ম — ভিডিও সহ"
                  active={isActive("namaz")}
                  onClick={go(goNamaz)}
                />
                <MobileNavItem
                  icon={BookOpen}
                  label="ব্লগ"
                  desc="ইসলামিক আর্টিকেল"
                  active={isActive("blog") || isActive("blog-post")}
                  onClick={go(() => goBlog())}
                />
                <MobileNavItem
                  icon={ShoppingBag}
                  label="ইসলামিক বই"
                  desc="শপ — রকমারি বই"
                  active={isActive("shop")}
                  onClick={go(() => goShop())}
                />
                <MobileNavItem
                  icon={History}
                  label="ইতিহাস"
                  desc="আমলের হিসাব"
                  active={isActive("history")}
                  onClick={go(goHistory)}
                />
                <div className="my-2 h-px bg-border/60" />
                <MobileNavItem
                  icon={LayoutDashboard}
                  label="অ্যাডমিন"
                  desc="ব্লগ পাবলিশ"
                  active={
                    isActive("admin-login") || isActive("admin-dashboard")
                  }
                  onClick={go(goAdminLogin)}
                />
              </nav>
              <div className="mt-auto px-5 pb-6 pt-4">
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/5 p-3 text-emerald-700 dark:text-emerald-300">
                  <Heart className="h-4 w-4 shrink-0" />
                  <p className="font-bengali text-xs">
                    আল্লাহ আমাদের আমল করার তৌফিক দিন। আমিন।
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MobileNavItem({
  icon: Icon,
  label,
  desc,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer",
        active
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50"
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
          active
            ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex flex-col">
        <span className="font-bengali text-sm font-semibold">{label}</span>
        <span className="font-bengali text-[11px] text-muted-foreground">
          {desc}
        </span>
      </span>
    </button>
  );
}
