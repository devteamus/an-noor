"use client";

import * as React from "react";
import { useAppStore } from "@/lib/store";
import { dhikrItems, type DhikrItem } from "@/lib/dhikr-data";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CheckCircle2,
  RotateCcw,
  Plus,
  Minus,
  ChevronUp,
  Sparkles,
  Target,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Check,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function formatBn(n: number): string {
  return n.toLocaleString("bn-BD");
}

function todayKeyStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/* ============ Sticky bar ============ */
export function LiveTasbihBar() {
  const setTasbihPanelOpen = useAppStore((s) => s.setTasbihPanelOpen);
  const tasbihCounts = useAppStore((s) => s.tasbihCounts);
  const tasbihGoals = useAppStore((s) => s.tasbihGoals);

  const tk = todayKeyStr();
  const completedCount = dhikrItems.filter((d) => {
    const goal = tasbihGoals[d.id] ?? d.defaultTarget;
    const count = tasbihCounts[d.id]?.[tk] ?? 0;
    return count >= goal;
  }).length;
  const totalCount = dhikrItems.length;
  const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <>
      <button
        onClick={() => setTasbihPanelOpen(true)}
        className="sticky top-16 z-30 flex w-full cursor-pointer items-center gap-3 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 px-3 py-2 backdrop-blur-md transition-colors hover:from-emerald-100 hover:to-emerald-100 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-emerald-950/40 dark:hover:from-emerald-900/50 dark:hover:to-emerald-900/50"
        aria-label="লাইভ তসবিহ খুলুন"
      >
        <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="font-bengali text-xs font-bold text-foreground sm:text-sm">
            লাইভ তসবিহ
            <span className="ml-2 font-normal text-muted-foreground">
              আজকের আমল
            </span>
          </p>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="shrink-0 font-bengali text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              {formatBn(completedCount)}/{formatBn(totalCount)}
            </span>
          </div>
        </div>
        <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      <LiveTasbihPanel />
    </>
  );
}

/* ============ Bottom Sheet Panel — myislam.org style ============ */
function LiveTasbihPanel() {
  const open = useAppStore((s) => s.tasbihPanelOpen);
  const setOpen = useAppStore((s) => s.setTasbihPanelOpen);
  const tasbihIncrement = useAppStore((s) => s.tasbihIncrement);
  const tasbihReset = useAppStore((s) => s.tasbihReset);
  const tasbihCounts = useAppStore((s) => s.tasbihCounts);
  const tasbihGoals = useAppStore((s) => s.tasbihGoals);
  const activeDhikrId = useAppStore((s) => s.tasbihActiveDhikr);
  const setActiveDhikr = useAppStore((s) => s.setTasbihActiveDhikr);

  const tk = todayKeyStr();
  const activeDhikr =
    dhikrItems.find((d) => d.id === activeDhikrId) ?? dhikrItems[0];
  const goal = tasbihGoals[activeDhikr.id] ?? activeDhikr.defaultTarget;
  const count = tasbihCounts[activeDhikr.id]?.[tk] ?? 0;

  // audio playback
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [audioOn, setAudioOn] = React.useState(false);
  const [pulse, setPulse] = React.useState(false);

  const completedCount = dhikrItems.filter((d) => {
    const g = tasbihGoals[d.id] ?? d.defaultTarget;
    const c = tasbihCounts[d.id]?.[tk] ?? 0;
    return c >= g;
  }).length;

  const handleCount = () => {
    tasbihIncrement(activeDhikr.id);
    setPulse(true);
    setTimeout(() => setPulse(false), 250);
    if (audioOn && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const handleDecrease = () => {
    const newCount = Math.max(0, count - 1);
    // we need a direct set; use increment hack? No — we'll add a setter later.
    // For now, reset and re-add. Simpler: we add tasbihSetCount. But to avoid
    // bloating, we just reset to 0 if going below 0 isn't needed.
    // Actually let's just use the existing reset + manual increments is bad.
    // Quick approach: call reset then increment newCount times via a batch.
    // Better: add a setCount action. For now use reset if newCount===0 else do nothing fancy.
    if (newCount === 0) {
      tasbihReset(activeDhikr.id);
    } else {
      // set via reset + increment loop (cheap)
      tasbihReset(activeDhikr.id);
      for (let i = 0; i < newCount; i++) tasbihIncrement(activeDhikr.id);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto custom-scroll p-0"
      >
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="font-bengali text-center text-base">
            লাইভ তসবিহ
          </SheetTitle>
          <p className="font-bengali text-center text-[11px] text-muted-foreground">
            {formatBn(completedCount)}/{formatBn(dhikrItems.length)} টি আমল
            সম্পন্ন · বৃত্তে ট্যাপ করে গুন করুন
          </p>
        </SheetHeader>

        {/* ====== Main counter — myislam.org style ====== */}
        <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-teal-50 to-emerald-50 px-4 py-5 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-emerald-950/30">
          {/* audio element */}
          <audio ref={audioRef} src={activeDhikr.audio} preload="none" />

          {/* audio toggle (top-right) */}
          <button
            onClick={() => setAudioOn((v) => !v)}
            className={cn(
              "absolute right-4 top-4 grid h-9 w-9 cursor-pointer place-items-center rounded-full transition-colors",
              audioOn
                ? "bg-emerald-600 text-white"
                : "bg-white/70 text-muted-foreground hover:bg-white dark:bg-white/10"
            )}
            aria-label={audioOn ? "অডিও বন্ধ" : "অডিও চালু"}
            title={audioOn ? "অডিও চালু আছে" : "অডিও বন্ধ"}
          >
            {audioOn ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>

          {/* dhikr name + transliteration */}
          <div className="mb-1 text-center">
            <p className="font-bengali text-sm font-bold text-emerald-800 dark:text-emerald-300">
              {activeDhikr.name}
            </p>
            <p className="font-bengali text-[11px] text-muted-foreground">
              {activeDhikr.transliteration}
            </p>
          </div>

          {/* ====== Big circular counter ====== */}
          <div className="relative mx-auto my-3 grid h-56 w-56 place-items-center sm:h-60 sm:w-60">
            {/* tasbih beads string — decorative rotating ring */}
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute inset-0"
            >
              {Array.from({ length: 33 }).map((_, i) => {
                const angle = (i / 33) * 360;
                return (
                  <span
                    key={i}
                    className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-110px)`,
                      background:
                        i % 11 === 0
                          ? "oklch(0.6 0.15 85)"
                          : "oklch(0.52 0.13 160 / 0.55)",
                      transformOrigin: "center",
                    }}
                  />
                );
              })}
            </motion.span>

            {/* progress ring (SVG) */}
            <svg
              className="absolute inset-0 h-full w-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                className="stroke-emerald-100 dark:stroke-emerald-900/40"
                strokeWidth="3"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="oklch(0.52 0.13 160)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 44}
                initial={false}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 44 * (1 - Math.min(1, count / goal)),
                }}
                transition={{ duration: 0.3 }}
              />
            </svg>

            {/* tap surface — the count */}
            <button
              onClick={handleCount}
              className="group relative grid h-44 w-44 cursor-pointer select-none place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-500/40 transition-all active:scale-95 sm:h-48 sm:w-48"
              aria-label="গুন করুন"
            >
              <span className="pointer-events-none absolute inset-3 rounded-full border border-white/25" />
              <span className="pointer-events-none absolute inset-6 rounded-full border border-white/15" />
              <motion.span
                animate={pulse ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                transition={{ duration: 0.25 }}
                className="relative flex flex-col items-center"
              >
                <motion.span
                  key={count}
                  initial={{ scale: 0.6, opacity: 0.4 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="font-bengali text-6xl font-bold tabular-nums leading-none sm:text-7xl"
                >
                  {formatBn(count)}
                </motion.span>
                <span className="mt-1 font-bengali text-xs text-white/80">
                  / {formatBn(goal)}
                </span>
                {count >= goal ? (
                  <span className="mt-1 flex items-center gap-1 font-bengali text-xs font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    সম্পন্ন
                  </span>
                ) : (
                  <span className="mt-1 flex items-center gap-1 font-bengali text-[10px] text-white/70">
                    <Plus className="h-3 w-3" />
                    ট্যাপ করুন
                  </span>
                )}
              </motion.span>
            </button>
          </div>

          {/* Arabic + virtue */}
          <div className="mb-3 text-center">
            <p className="font-arabic text-2xl leading-tight text-foreground">
              {activeDhikr.arabic}
            </p>
            <p className="mt-1 font-bengali text-[11px] italic text-muted-foreground">
              {activeDhikr.virtue}
            </p>
          </div>

          {/* ====== Buttons: − / Reset / + (myislam.org style) ====== */}
          <div className="mx-auto flex max-w-xs items-center justify-center gap-2">
            <button
              onClick={handleDecrease}
              disabled={count === 0}
              className="grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-white text-xl font-bold text-emerald-700 shadow-md transition-all hover:bg-emerald-50 active:scale-90 disabled:opacity-40 dark:bg-white/10 dark:text-emerald-300"
              aria-label="এক কমান"
            >
              <Minus className="h-5 w-5" />
            </button>
            <button
              onClick={() => tasbihReset(activeDhikr.id)}
              className="grid h-12 cursor-pointer place-items-center gap-0.5 rounded-full bg-white px-5 font-bengali text-xs font-bold text-rose-600 shadow-md transition-all hover:bg-rose-50 active:scale-95 dark:bg-white/10 dark:text-rose-300"
              aria-label="রিসেট"
            >
              <RotateCcw className="h-4 w-4" />
              রিসেট
            </button>
            <button
              onClick={handleCount}
              className="grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-emerald-600 text-xl font-bold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-90"
              aria-label="এক বাড়ান"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* goal setter */}
          <GoalSetter dhikrId={activeDhikr.id} fallback={activeDhikr.defaultTarget} />
        </div>

        {/* ====== Dhikr selector — horizontal pills ====== */}
        <div className="border-t border-border/60 bg-background px-4 py-3">
          <p className="mb-2 font-bengali text-xs font-semibold text-muted-foreground">
            জিকির নির্বাচন করুন
          </p>
          <div className="flex gap-2 overflow-x-auto custom-scroll pb-2">
            {dhikrItems.map((d) => {
              const g = tasbihGoals[d.id] ?? d.defaultTarget;
              const c = tasbihCounts[d.id]?.[tk] ?? 0;
              const done = c >= g;
              const isActive = d.id === activeDhikr.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDhikr(d.id)}
                  className={cn(
                    "relative flex shrink-0 cursor-pointer flex-col items-center gap-0.5 rounded-xl border px-3 py-2 transition-all",
                    isActive
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                      : "border-border/60 bg-card hover:bg-accent/40"
                  )}
                >
                  <span
                    className={cn(
                      "font-bengali text-[11px] font-bold",
                      isActive
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-foreground"
                    )}
                  >
                    {d.name.length > 18 ? d.name.slice(0, 16) + "…" : d.name}
                  </span>
                  <span className="font-bengali text-[9px] text-muted-foreground">
                    {formatBn(c)}/{formatBn(g)}
                  </span>
                  {done && (
                    <CheckCircle2 className="absolute -right-1 -top-1 h-4 w-4 text-emerald-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* progress overview */}
        <div className="bg-background px-4 pb-6 pt-1">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <p className="mb-2 font-bengali text-xs font-semibold text-foreground">
              আজকের অগ্রগতি
            </p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {dhikrItems.slice(0, 8).map((d) => {
                const g = tasbihGoals[d.id] ?? d.defaultTarget;
                const c = tasbihCounts[d.id]?.[tk] ?? 0;
                const done = c >= g;
                return (
                  <div
                    key={d.id}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2 py-1",
                      done
                        ? "bg-emerald-500/10"
                        : "bg-background"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-4 w-4 shrink-0 place-items-center rounded-full text-[8px] font-bold text-white",
                        done ? "bg-emerald-600" : "bg-muted-foreground/40"
                      )}
                    >
                      {done ? "✓" : ""}
                    </span>
                    <span className="truncate font-bengali text-[10px] text-foreground">
                      {d.name.length > 12 ? d.name.slice(0, 10) + "…" : d.name}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-center font-bengali text-[10px] text-muted-foreground">
              আরও {formatBn(Math.max(0, dhikrItems.length - 8))} টি জিকির উপরের
              তালিকায়
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ============ Goal setter (compact) ============ */
function GoalSetter({
  dhikrId,
  fallback,
}: {
  dhikrId: string;
  fallback: number;
}) {
  const tasbihGoals = useAppStore((s) => s.tasbihGoals);
  const tasbihSetGoal = useAppStore((s) => s.tasbihSetGoal);
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(tasbihGoals[dhikrId] ?? fallback);

  React.useEffect(() => {
    setVal(tasbihGoals[dhikrId] ?? fallback);
  }, [dhikrId, tasbihGoals, fallback]);

  const current = tasbihGoals[dhikrId] ?? fallback;

  if (!editing) {
    return (
      <div className="mt-3 flex items-center justify-center">
        <button
          onClick={() => setEditing(true)}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-emerald-500/30 bg-white/60 px-3 py-1 font-bengali text-[11px] text-emerald-700 transition-colors hover:bg-white dark:bg-white/10 dark:text-emerald-300"
        >
          <Target className="h-3 w-3" />
          দৈনিক লক্ষ্য: {formatBn(current)}
          <Pencil className="h-2.5 w-2.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center justify-center gap-1">
      <button
        onClick={() => setVal((v) => Math.max(1, v - 1))}
        className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white shadow-sm hover:bg-accent dark:bg-white/10"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(Math.max(1, Number(e.target.value) || 1))}
        className="w-20 rounded-full border border-emerald-500/40 bg-background px-3 py-1 text-center font-bengali text-sm font-bold outline-none"
      />
      <button
        onClick={() => setVal((v) => v + 1)}
        className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white shadow-sm hover:bg-accent dark:bg-white/10"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => {
          tasbihSetGoal(dhikrId, val);
          setEditing(false);
        }}
        className="ml-1 flex cursor-pointer items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 font-bengali text-xs font-bold text-white hover:bg-emerald-700"
      >
        <Check className="h-3 w-3" />
        সেভ
      </button>
      <button
        onClick={() => {
          setVal(current);
          setEditing(false);
        }}
        className="cursor-pointer rounded-full px-2 py-1.5 font-bengali text-xs text-muted-foreground hover:bg-accent"
      >
        বাতিল
      </button>
    </div>
  );
}
