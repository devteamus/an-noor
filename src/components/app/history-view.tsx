"use client";

import * as React from "react";
import { useAppStore } from "@/lib/store";
import { duas, categories, getDuaById, getCategoryById } from "@/lib/dua-data";
import { dhikrItems } from "@/lib/dhikr-data";
import { computeAmalStats } from "@/lib/amal-stats";
import { CategoryIcon } from "@/components/app/icon-map";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  TrendingUp,
  Trash2,
  ChevronRight,
  Award,
  Target,
  Sparkles,
  Flame,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function bengaliDate(key: string): string {
  // key: YYYY-MM-DD
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const months = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];
  const dayNames = [
    "রবিবার",
    "সোমবার",
    "মঙ্গলবার",
    "বুধবার",
    "বৃহস্পতিবার",
    "শুক্রবার",
    "শনিবার",
  ];
  const num = (n: number) => n.toLocaleString("bn-BD");
  return `${num(date.getDate())} ${months[date.getMonth()]}, ${num(
    date.getFullYear()
  )} · ${dayNames[date.getDay()]}`;
}

export function HistoryView() {
  const counts = useAppStore((s) => s.counts);
  const tasbihCounts = useAppStore((s) => s.tasbihCounts);
  const resetAll = useAppStore((s) => s.resetAll);
  const goCounter = useAppStore((s) => s.goCounter);
  const goHome = useAppStore((s) => s.goHome);
  const setTasbihActiveDhikr = useAppStore((s) => s.setTasbihActiveDhikr);
  const [confirmReset, setConfirmReset] = React.useState(false);

  // সব পরিসংখ্যান — দুআ + তসবিহ একসাথে
  const stats = computeAmalStats(counts, tasbihCounts);

  // দুআ + তসবিহ মিলিয়ে: তারিখ -> { আইডি -> কাউন্ট }
  // দুআ-র কী যেমন আছে তেমনই; তসবিহের কী "dhikr:" প্রিফিক্স সহ
  // (দুটো তালিকায় একই আইডি থাকতে পারে — যেমন "subhanallah")
  const byDate: Record<string, Record<string, number>> = {};
  for (const dua of duas) {
    const perDua = counts[dua.id] ?? {};
    for (const [dateKey, c] of Object.entries(perDua)) {
      if (!byDate[dateKey]) byDate[dateKey] = {};
      byDate[dateKey][dua.id] = c;
    }
  }
  for (const dhikr of dhikrItems) {
    const perDhikr = tasbihCounts[dhikr.id] ?? {};
    for (const [dateKey, c] of Object.entries(perDhikr)) {
      if (!byDate[dateKey]) byDate[dateKey] = {};
      byDate[dateKey][`dhikr:${dhikr.id}`] = c;
    }
  }

  const sortedDates = Object.keys(byDate).sort((a, b) => (a < b ? 1 : -1));

  // Today key
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const totalDays = stats.totalDays;
  const todayTotal = stats.todayTotal;

  // প্রতি ক্যাটাগরির মোট + তসবিহ (জিকির) সুডো-ক্যাটাগরি
  const perCategory = categories.map((cat) => {
    const catDuas = duas.filter((d) => d.categoryId === cat.id);
    const total = catDuas.reduce((sum, d) => {
      return (
        sum + Object.values(counts[d.id] ?? {}).reduce((a, b) => a + b, 0)
      );
    }, 0);
    return { cat, total };
  });
  const tasbihTotal = dhikrItems.reduce((sum, d) => {
    return (
      sum + Object.values(tasbihCounts[d.id] ?? {}).reduce((a, b) => a + b, 0)
    );
  }, 0);
  const maxCatTotal = Math.max(
    1,
    ...perCategory.map((p) => p.total),
    tasbihTotal
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <nav className="flex items-center gap-1.5 text-xs font-bengali text-muted-foreground">
          <button onClick={goHome} className="cursor-pointer hover:text-foreground">
            হোম
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">ইতিহাস</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-emerald-500/10 p-6 sm:p-7"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="relative">
            <Badge className="mb-3 gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15">
              <Calendar className="h-3 w-3" />
              আমলের ইতিহাস
            </Badge>
            <h1 className="font-bengali text-xl font-bold text-foreground sm:text-2xl">
              আপনার আমলের সারসংক্ষেপ
            </h1>
            <p className="mt-1 font-bengali text-sm text-muted-foreground">
              দুআ ও তসবিহ — কোন তারিখে কতবার পড়েছেন তার বিস্তারিত হিসাব।
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              <Stat label="মোট আমল" value={stats.grandTotal} color="text-emerald-600 dark:text-emerald-400" />
              <Stat label="আজকের" value={todayTotal} color="text-amber-600 dark:text-amber-400" />
              <Stat label="দিন গণনা" value={totalDays} color="text-sky-600 dark:text-sky-400" />
              <Stat label="গড়/দিন" value={stats.avgPerDay} color="text-teal-600 dark:text-teal-400" />
              <Stat label="ধারাবাহিকতা" value={stats.streak} suffix=" দিন" color="text-rose-600 dark:text-rose-400" icon={<Flame className="h-3.5 w-3.5" />} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category distribution */}
      {stats.grandTotal > 0 && (
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-bengali text-sm font-semibold text-foreground">
              ক্যাটাগরি অনুযায়ী আমল
            </h3>
          </div>
          <div className="space-y-3">
            {perCategory.map(({ cat, total }) => {
              const pct = (total / maxCatTotal) * 100;
              return (
                <div key={cat.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white",
                      cat.color
                    )}
                  >
                    <CategoryIcon name={cat.icon} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate font-bengali text-xs text-foreground">
                        {cat.name}
                      </span>
                      <span className="font-bengali text-xs font-semibold text-foreground">
                        {total.toLocaleString("bn-BD")}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5 }}
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r",
                          cat.color
                        )}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {/* তসবিহ (জিকির) — লাইভ কাউন্টারের হিসাব */}
            {tasbihTotal > 0 && (
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate font-bengali text-xs text-foreground">
                      তসবিহ (জিকির)
                    </span>
                    <span className="font-bengali text-xs font-semibold text-foreground">
                      {tasbihTotal.toLocaleString("bn-BD")}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(tasbihTotal / maxCatTotal) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Date-wise list */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bengali text-lg font-semibold text-foreground">
            তারিখ অনুযায়ী আমল
          </h2>
          {stats.grandTotal > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmReset(true)}
              className="gap-1.5 font-bengali text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              সব মুছুন
            </Button>
          )}
        </div>

        {sortedDates.length === 0 ? (
          <Card className="grid place-items-center p-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
              <Sparkles className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-3 font-bengali text-sm font-medium text-foreground">
              এখনও কোনো আমল গুন হয়নি
            </p>
            <p className="mt-1 font-bengali text-xs text-muted-foreground">
              কোনো দুআ খুলে গুন করা শুরু করুন। সব হিসাব এখানে দেখা যাবে।
            </p>
            <Button
              onClick={goHome}
              className="mt-4 gap-1.5 font-bengali cursor-pointer"
            >
              <Target className="h-4 w-4" />
              দুআ বেছে নিন
            </Button>
          </Card>
        ) : (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto custom-scroll pr-1">
            {sortedDates.map((dateKey, idx) => {
              const dayCounts = byDate[dateKey];
              const dayTotal = Object.values(dayCounts).reduce(
                (a, b) => a + b,
                0
              );
              const isToday = dateKey === todayKey;
              const duaIds = Object.keys(dayCounts);

              return (
                <motion.div
                  key={dateKey}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.3) }}
                >
                  <Card
                    className={cn(
                      "overflow-hidden border-border/60 p-0",
                      isToday && "border-emerald-500/40"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3",
                        isToday ? "bg-emerald-500/5" : "bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bengali text-sm font-semibold text-foreground">
                          {bengaliDate(dateKey)}
                        </span>
                        {isToday && (
                          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15">
                            আজ
                          </Badge>
                        )}
                      </div>
                      <span className="font-bengali text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {dayTotal.toLocaleString("bn-BD")} বার
                      </span>
                    </div>

                    <div className="divide-y divide-border/40">
                      {duaIds.map((duaId) => {
                        // "dhikr:xxx" — লাইভ তসবিহ; নাহলে দুআ
                        const isDhikr = duaId.startsWith("dhikr:");
                        const dhikr = isDhikr
                          ? dhikrItems.find(
                              (d) => d.id === duaId.slice(6)
                            )
                          : undefined;
                        const dua = !isDhikr ? getDuaById(duaId) : undefined;
                        const cat = dua
                          ? getCategoryById(dua.categoryId)
                          : undefined;
                        const c = dayCounts[duaId];
                        if (!dua && !dhikr) return null;
                        return (
                          <button
                            key={duaId}
                            onClick={() => {
                              if (dhikr) {
                                // জিকির নির্বাচন করে হোমের কাউন্টারে পাঠাই
                                setTasbihActiveDhikr(dhikr.id);
                                goHome();
                              } else if (dua) {
                                goCounter(dua.id);
                              }
                            }}
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/40"
                          >
                            {dhikr ? (
                              <span
                                className={cn(
                                  "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                                )}
                              >
                                <Sparkles className="h-3 w-3" />
                              </span>
                            ) : cat ? (
                              <span
                                className={cn(
                                  "h-2 w-2 shrink-0 rounded-full bg-gradient-to-br",
                                  cat.color
                                )}
                              />
                            ) : (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-muted" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bengali text-xs font-medium text-foreground">
                                {dhikr ? dhikr.name : dua?.title}
                              </p>
                              <p className="truncate font-bengali text-[10px] text-muted-foreground">
                                {dhikr ? "তসবিহ · জিকির" : cat?.name}
                              </p>
                            </div>
                            <span className="font-bengali text-xs font-semibold text-foreground">
                              {c.toLocaleString("bn-BD")}
                            </span>
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reset confirm dialog (simple inline) */}
      {confirmReset && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center border-0 bg-background/80 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl"
          >
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="mt-3 text-center font-bengali text-lg font-bold text-foreground">
              সব হিসাব মুছে ফেলবেন?
            </h3>
            <p className="mt-1 text-center font-bengali text-sm text-muted-foreground">
              এটি আপনার সমস্ত আমলের গুনতি মুছে ফেলবে। এই কাজটি ফিরিয়ে আনা যাবে না।
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                className="flex-1 font-bengali cursor-pointer"
                onClick={() => setConfirmReset(false)}
              >
                বাতিল
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-1.5 font-bengali cursor-pointer"
                onClick={() => {
                  resetAll();
                  setConfirmReset(false);
                }}
              >
                <Trash2 className="h-4 w-4" />
                মুছে ফেলুন
              </Button>
            </div>
          </motion.div>
        </Card>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
  suffix = "",
  icon,
}: {
  label: string;
  value: number;
  color: string;
  suffix?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-center backdrop-blur">
      <p className={cn("flex items-center justify-center gap-0.5 font-bengali text-xl font-bold sm:text-2xl", color)}>
        {icon}
        {value.toLocaleString("bn-BD")}
        <span className="text-[10px] font-semibold sm:text-xs">{suffix}</span>
      </p>
      <p className="font-bengali text-[10px] text-muted-foreground sm:text-[11px]">
        {label}
      </p>
    </div>
  );
}
