"use client";

import * as React from "react";
import { useAppStore } from "@/lib/store";
import { dhikrItems } from "@/lib/dhikr-data";
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
  ChevronDown,
  Sparkles,
  Volume2,
  VolumeX,
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

/**
 * RoundTasbih — compact round digital tasbih for the home hero.
 * Tap the circle to count; switch dhikr via the selector; set goal; audio toggle.
 */
export function RoundTasbih() {
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
  const completed = count >= goal;

  const [pulse, setPulse] = React.useState(false);
  const [audioOn, setAudioOn] = React.useState(false);
  const [showSelector, setShowSelector] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState(false);
  const [goalVal, setGoalVal] = React.useState(goal);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    setGoalVal(goal);
  }, [goal, activeDhikr.id]);

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
    if (count <= 0) return;
    tasbihReset(activeDhikr.id);
    for (let i = 0; i < count - 1; i++) tasbihIncrement(activeDhikr.id);
  };

  return (
    <div className="relative flex flex-col items-center">
      <audio ref={audioRef} src={activeDhikr.audio} preload="none" />

      {/* dhikr name + transliteration */}
      <div className="mb-2 text-center">
        <p className="font-bengali text-sm font-bold text-emerald-800 dark:text-emerald-300">
          {activeDhikr.name}
        </p>
        <p className="font-bengali text-[10px] text-muted-foreground">
          {activeDhikr.transliteration}
        </p>
      </div>

      {/* ====== Round counter ====== */}
      <div className="relative grid h-44 w-44 place-items-center sm:h-52 sm:w-52">
        {/* rotating bead ring */}
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute inset-0"
        >
          {Array.from({ length: 33 }).map((_, i) => {
            const angle = (i / 33) * 360;
            const r = 86;
            return (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
                style={{
                  transform: `translate(-50%,-50%) rotate(${angle}deg) translateY(-${r}px)`,
                  background:
                    i % 11 === 0
                      ? "oklch(0.6 0.15 85)"
                      : "oklch(0.52 0.13 160 / 0.5)",
                }}
              />
            );
          })}
        </motion.span>

        {/* progress ring */}
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

        {/* tap surface */}
        <button
          onClick={handleCount}
          className="group relative grid h-36 w-36 cursor-pointer select-none place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-500/40 transition-all active:scale-95 sm:h-44 sm:w-44"
          aria-label="গুন করুন"
        >
          <span className="pointer-events-none absolute inset-2 rounded-full border border-white/25" />
          <span className="pointer-events-none absolute inset-5 rounded-full border border-white/15" />
          <motion.span
            animate={pulse ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.25 }}
            className="relative flex flex-col items-center"
          >
            <motion.span
              key={count}
              initial={{ scale: 0.6, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="font-bengali text-5xl font-bold tabular-nums leading-none sm:text-6xl"
            >
              {formatBn(count)}
            </motion.span>
            <span className="mt-1 font-bengali text-[10px] text-white/80">
              / {formatBn(goal)}
            </span>
            {completed ? (
              <span className="mt-0.5 flex items-center gap-1 font-bengali text-[10px] font-bold">
                <CheckCircle2 className="h-3 w-3" />
                সম্পন্ন
              </span>
            ) : (
              <span className="mt-0.5 flex items-center gap-1 font-bengali text-[9px] text-white/70">
                <Plus className="h-2.5 w-2.5" />
                ট্যাপ
              </span>
            )}
          </motion.span>
        </button>
      </div>

      {/* Arabic + virtue */}
      <div className="mt-2 text-center">
        <p className="font-arabic text-lg leading-tight text-foreground">
          {activeDhikr.arabic}
        </p>
        <p className="font-bengali text-[10px] italic text-muted-foreground">
          {activeDhikr.virtue}
        </p>
      </div>

      {/* controls */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleDecrease}
          disabled={count === 0}
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 active:scale-90 disabled:opacity-40 dark:bg-white/10 dark:text-emerald-300"
          aria-label="এক কমান"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => tasbihReset(activeDhikr.id)}
          className="grid h-9 cursor-pointer place-items-center rounded-full bg-white px-3 font-bengali text-[10px] font-bold text-rose-600 shadow-sm transition-all hover:bg-rose-50 active:scale-95 dark:bg-white/10 dark:text-rose-300"
          aria-label="রিসেট"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleCount}
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-emerald-600 text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-90"
          aria-label="এক বাড়ান"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => setAudioOn((v) => !v)}
          className={cn(
            "grid h-9 w-9 cursor-pointer place-items-center rounded-full shadow-sm transition-all",
            audioOn
              ? "bg-emerald-600 text-white"
              : "bg-white text-muted-foreground hover:bg-accent dark:bg-white/10"
          )}
          aria-label={audioOn ? "অডিও বন্ধ" : "অডিও চালু"}
        >
          {audioOn ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* dhikr selector trigger */}
      <button
        onClick={() => setShowSelector(true)}
        className="mt-3 flex cursor-pointer items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1 font-bengali text-[10px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
      >
        <Sparkles className="h-3 w-3" />
        জিকির পরিবর্তন
        <ChevronDown className="h-3 w-3" />
      </button>

      {/* goal setter */}
      <div className="mt-2">
        {editingGoal ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setGoalVal((v) => Math.max(1, v - 1))}
              className="grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-white shadow-sm hover:bg-accent dark:bg-white/10"
            >
              <Minus className="h-3 w-3" />
            </button>
            <input
              type="number"
              value={goalVal}
              onChange={(e) =>
                setGoalVal(Math.max(1, Number(e.target.value) || 1))
              }
              className="w-16 rounded-full border border-emerald-500/40 bg-background px-2 py-0.5 text-center font-bengali text-xs font-bold outline-none"
            />
            <button
              onClick={() => setGoalVal((v) => v + 1)}
              className="grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-white shadow-sm hover:bg-accent dark:bg-white/10"
            >
              <Plus className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                useAppStore.getState().tasbihSetGoal(activeDhikr.id, goalVal);
                setEditingGoal(false);
              }}
              className="flex cursor-pointer items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 font-bengali text-[10px] font-bold text-white"
            >
              <Check className="h-2.5 w-2.5" />
              সেভ
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingGoal(true)}
            className="flex cursor-pointer items-center gap-1 font-bengali text-[10px] text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-2.5 w-2.5" />
            লক্ষ্য: {formatBn(goal)}
          </button>
        )}
      </div>

      {/* ====== Dhikr selector sheet ====== */}
      <Sheet open={showSelector} onOpenChange={setShowSelector}>
        <SheetContent
          side="bottom"
          className="max-h-[75vh] overflow-y-auto custom-scroll"
        >
          <SheetHeader>
            <SheetTitle className="font-bengali text-left text-base">
              জিকির নির্বাচন করুন
            </SheetTitle>
          </SheetHeader>
          <div className="mt-3 grid grid-cols-2 gap-2 pb-6 sm:grid-cols-3">
            {dhikrItems.map((d) => {
              const g = tasbihGoals[d.id] ?? d.defaultTarget;
              const c = tasbihCounts[d.id]?.[tk] ?? 0;
              const done = c >= g;
              const isActive = d.id === activeDhikr.id;
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    setActiveDhikr(d.id);
                    setShowSelector(false);
                  }}
                  className={cn(
                    "relative flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition-all",
                    isActive
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                      : "border-border/60 bg-card hover:bg-accent/40"
                  )}
                >
                  {done && (
                    <CheckCircle2 className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-emerald-600" />
                  )}
                  <p className="font-arabic text-base leading-tight text-foreground">
                    {d.arabic}
                  </p>
                  <p
                    className={cn(
                      "font-bengali text-[11px] font-bold leading-tight",
                      isActive
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-foreground"
                    )}
                  >
                    {d.name.length > 22 ? d.name.slice(0, 20) + "…" : d.name}
                  </p>
                  <p className="font-bengali text-[9px] text-muted-foreground">
                    {formatBn(c)}/{formatBn(g)}
                  </p>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
