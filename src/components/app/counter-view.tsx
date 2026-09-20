"use client";

import * as React from "react";
import { useAppStore } from "@/lib/store";
import { getDuaById, getCategoryById } from "@/lib/dua-data";
import { CategoryIcon } from "@/components/app/icon-map";
import { YouTubeAudioPlayer } from "@/components/app/youtube-audio-player";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Target,
  Award,
  BookOpen,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function CounterView({ duaId }: { duaId: string }) {
  const dua = getDuaById(duaId);
  const goCategory = useAppStore((s) => s.goCategory);
  const goHome = useAppStore((s) => s.goHome);
  const increment = useAppStore((s) => s.increment);
  const resetToday = useAppStore((s) => s.resetToday);
  const setCountToday = useAppStore((s) => s.setCountToday);
  const getTodayCount = useAppStore((s) => s.getTodayCount);
  const getTotalCount = useAppStore((s) => s.getTotalCount);
  const counts = useAppStore((s) => s.counts);

  const [pulse, setPulse] = React.useState(false);
  const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);
  const [showCelebration, setShowCelebration] = React.useState(false);
  const rippleId = React.useRef(0);
  const prevCount = React.useRef(0);

  const todayKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  })();

  const todayCount = getTodayCount(duaId);
  const totalCount = getTotalCount(duaId);

  React.useEffect(() => {
    prevCount.current = todayCount;
  }, [todayCount]);

  // Trigger celebration when reaching target exactly
  React.useEffect(() => {
    if (
      dua &&
      todayCount === dua.target &&
      todayCount > 0 &&
      prevCount.current < dua.target
    ) {
      setShowCelebration(true);
      const t = setTimeout(() => setShowCelebration(false), 2600);
      return () => clearTimeout(t);
    }
  }, [todayCount, dua]);

  if (!dua) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <p className="font-bengali text-muted-foreground">দুআ পাওয়া যায়নি।</p>
        <Button onClick={goHome} className="mt-4 font-bengali">
          হোমে ফিরুন
        </Button>
      </div>
    );
  }

  const category = getCategoryById(dua.categoryId);

  const progress = Math.min(100, (todayCount / dua.target) * 100);
  const completed = todayCount >= dua.target;
  const remaining = Math.max(0, dua.target - todayCount);

  const handleCount = (e: React.MouseEvent<HTMLButtonElement>) => {
    increment(duaId);
    setPulse(true);
    setTimeout(() => setPulse(false), 300);

    // Ripple at click position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = rippleId.current++;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs font-bengali text-muted-foreground custom-scroll">
        <button onClick={goHome} className="cursor-pointer hover:text-foreground">
          হোম
        </button>
        <ChevronRight className="h-3 w-3 shrink-0" />
        {category && (
          <>
            <button
              onClick={() => goCategory(category.id)}
              className="cursor-pointer hover:text-foreground"
            >
              {category.name}
            </button>
            <ChevronRight className="h-3 w-3 shrink-0" />
          </>
        )}
        <span className="text-foreground">{dua.title}</span>
      </nav>

      {/* Dua info card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden border-border/60 p-0">
          {/* Title bar */}
          <div
            className={cn(
              "flex items-center gap-3 bg-gradient-to-br p-4 text-white",
              category?.color ?? "from-emerald-500 to-teal-600"
            )}
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur">
              {category && (
                <CategoryIcon name={category.icon} className="h-5 w-5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-bengali text-lg font-bold leading-tight sm:text-xl">
                {dua.title}
              </h1>
              {category && (
                <p className="font-bengali text-xs text-white/80">
                  {category.name}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            {/* Arabic */}
            <div className="rounded-xl bg-muted/40 p-4 text-center sm:p-5">
              <p className="font-arabic text-2xl leading-loose text-foreground sm:text-3xl">
                {dua.arabic}
              </p>
            </div>

            {/* Transliteration */}
            <div>
              <p className="mb-1 font-bengali text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                উচ্চারণ
              </p>
              <p className="font-bengali text-sm leading-relaxed text-foreground/90 sm:text-base">
                {dua.transliteration}
              </p>
            </div>

            {/* Meaning */}
            <div>
              <div className="mb-1 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <p className="font-bengali text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  অর্থ
                </p>
              </div>
              <p className="font-bengali text-sm leading-relaxed text-foreground sm:text-base">
                {dua.meaning}
              </p>
            </div>

            {/* Virtue */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5">
              <div className="mb-1 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <p className="font-bengali text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  ফজিলত
                </p>
              </div>
              <p className="font-bengali text-sm leading-relaxed text-foreground/90">
                {dua.virtue}
              </p>
              {dua.reference && (
                <p className="mt-2 font-bengali text-[11px] text-muted-foreground">
                  সূত্র: {dua.reference}
                </p>
              )}
            </div>

            {/* YouTube audio player for surahs */}
            {dua.youtubeUrl && (
              <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="mb-2 flex items-center gap-1.5 font-bengali text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="h-3 w-3" />
                  অডিও শুনে শিখুন
                </p>
                <YouTubeAudioPlayer
                  url={dua.youtubeUrl}
                  title={dua.title}
                  compact={true}
                  accentColor={category?.color ?? "from-emerald-500 to-teal-600"}
                />
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Counter card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="relative overflow-hidden border-emerald-500/30 p-5 sm:p-7">
          {/* Celebration overlay */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-emerald-500/10 backdrop-blur-sm"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg"
                  >
                    <Award className="h-8 w-8" />
                  </motion.div>
                  <p className="mt-3 font-bengali text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    আলহামদুলিল্লাহ! 🌿
                  </p>
                  <p className="font-bengali text-sm text-foreground/80">
                    আজকের লক্ষ্য পূরণ হয়েছে
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Target & progress */}
          <div className="mb-5 space-y-2">
            <div className="flex items-center justify-between font-bengali text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Target className="h-4 w-4" />
                আজকের লক্ষ্য
              </span>
              <span className="font-semibold text-foreground">
                {todayCount.toLocaleString("bn-BD")} /{" "}
                {dua.target.toLocaleString("bn-BD")}
              </span>
            </div>
            <Progress
              value={progress}
              className="h-2.5 bg-muted"
              style={
                {
                  background: "var(--muted)",
                } as React.CSSProperties
              }
            />
            <div className="flex items-center justify-between font-bengali text-xs">
              <span className="text-muted-foreground">
                {completed
                  ? "লক্ষ্য অর্জিত — আল্লাহ কবুল করুন 🤲"
                  : `আর ${remaining.toLocaleString("bn-BD")} বার বাকি`}
              </span>
              <span className="text-muted-foreground">
                মোট:{" "}
                <span className="font-semibold text-foreground">
                  {totalCount.toLocaleString("bn-BD")}
                </span>
              </span>
            </div>
          </div>

          {/* Animated Tasbih Counter — circular design */}
          <div className="relative mx-auto mb-5 grid place-items-center py-2">
            <button
              onClick={handleCount}
              className="group relative grid h-64 w-64 select-none place-items-center rounded-full sm:h-72 sm:w-72"
              aria-label="আমল গুন করুন"
            >
              {/* rotating outer ring (tasbih beads feel) */}
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  background: completed
                    ? "conic-gradient(from 0deg, oklch(0.52 0.13 160) 0%, oklch(0.6 0.15 85) 25%, oklch(0.52 0.13 160) 50%, oklch(0.6 0.15 85) 75%, oklch(0.52 0.13 160) 100%)"
                    : "conic-gradient(from 0deg, oklch(0.52 0.13 160 / 0.8) 0%, oklch(0.6 0.15 85 / 0.6) 25%, oklch(0.52 0.13 160 / 0.8) 50%, oklch(0.6 0.15 85 / 0.6) 75%, oklch(0.52 0.13 160 / 0.8) 100%)",
                  padding: "3px",
                  WebkitMask:
                    "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                  mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                }}
              />
              {/* progress ring */}
              <svg
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  className="stroke-muted"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="oklch(0.52 0.13 160)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 46}
                  initial={false}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 46 * (1 - Math.min(1, progress / 100)),
                  }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
              {/* inner circle (the tap surface) */}
              <motion.span
                animate={pulse ? { scale: [1, 0.92, 1] } : { scale: 1 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "relative grid h-52 w-52 place-items-center rounded-full bg-gradient-to-br text-white shadow-2xl transition-shadow sm:h-56 sm:w-56",
                  completed
                    ? "from-emerald-600 to-teal-700 shadow-emerald-500/40"
                    : "from-emerald-500 to-teal-600 shadow-emerald-500/30 group-hover:shadow-emerald-500/50"
                )}
              >
                {/* decorative inner rings */}
                <span className="pointer-events-none absolute inset-3 rounded-full border border-white/20" />
                <span className="pointer-events-none absolute inset-6 rounded-full border border-white/10" />
                {/* ripples */}
                {ripples.map((r) => (
                  <span
                    key={r.id}
                    className="tap-ripple"
                    style={{
                      left: r.x - 8,
                      top: r.y - 8,
                      width: 16,
                      height: 16,
                    }}
                  />
                ))}

                {/* count number + label */}
                <span className="relative flex flex-col items-center">
                  <motion.span
                    animate={pulse ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="font-bengali text-6xl font-bold tabular-nums leading-none sm:text-7xl"
                  >
                    {todayCount.toLocaleString("bn-BD")}
                  </motion.span>
                  <span className="mt-1 font-bengali text-xs text-white/70">
                    / {dua.target.toLocaleString("bn-BD")}
                  </span>
                  {completed ? (
                    <span className="mt-2 flex items-center gap-1 font-bengali text-sm font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                      সম্পন্ন
                    </span>
                  ) : (
                    <span className="mt-2 flex items-center gap-1 font-bengali text-xs text-white/80">
                      <Plus className="h-3.5 w-3.5" />
                      ট্যাপ করুন
                    </span>
                  )}
                </span>
              </motion.span>
            </button>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCountToday(duaId, Math.max(0, todayCount - 1))}
              disabled={todayCount <= 0}
              className="gap-1.5 font-bengali cursor-pointer"
            >
              <Minus className="h-4 w-4" />
              ১ কমান
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetToday(duaId);
              }}
              className="gap-1.5 font-bengali cursor-pointer hover:text-destructive"
            >
              <RotateCcw className="h-4 w-4" />
              রিসেট
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Recent 7 days mini history for this dua */}
      <SevenDayMiniHistory duaId={duaId} />
    </div>
  );
}

function SevenDayMiniHistory({ duaId }: { duaId: string }) {
  const counts = useAppStore((s) => s.counts);
  const perDua = counts[duaId] ?? {};

  const days: { label: string; key: string; count: number }[] = [];
  const now = new Date();
  const dayNames = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({
      label: dayNames[d.getDay()],
      key,
      count: perDua[key] ?? 0,
    });
  }

  const max = Math.max(1, ...days.map((d) => d.count));

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Target className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-bengali text-sm font-semibold text-foreground">
          গত ৭ দিনের আমল
        </h3>
      </div>
      <div className="flex items-end justify-between gap-2">
        {days.map((day, idx) => {
          const heightPct = (day.count / max) * 100;
          const isToday = idx === days.length - 1;
          return (
            <div
              key={day.key}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <span className="font-bengali text-[10px] font-semibold text-foreground">
                {day.count > 0 ? day.count.toLocaleString("bn-BD") : "—"}
              </span>
              <div className="flex h-20 w-full items-end justify-center rounded-md bg-muted/40">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className={cn(
                    "w-3/4 rounded-t-md",
                    isToday
                      ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                      : "bg-gradient-to-t from-emerald-500/60 to-emerald-400/60"
                  )}
                  style={{ minHeight: day.count > 0 ? 4 : 0 }}
                />
              </div>
              <span
                className={cn(
                  "font-bengali text-[10px]",
                  isToday
                    ? "font-bold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
