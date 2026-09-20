"use client";

import * as React from "react";
import {
  namesOfAllah,
  supremeName,
  type NameOfAllah,
} from "@/lib/names-of-allah";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Volume2,
  X,
  SkipBack,
  SkipForward,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function NamesOfAllahView() {
  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [playingId, setPlayingId] = React.useState<number | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [current, setCurrent] = React.useState(0);
  const [autoPlayNext, setAutoPlayNext] = React.useState(false);

  // debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const filtered = React.useMemo(() => {
    if (!debouncedQ.trim()) return namesOfAllah;
    const query = debouncedQ.toLowerCase().trim();
    return namesOfAllah.filter(
      (n) =>
        n.transliteration.toLowerCase().includes(query) ||
        n.meaning.toLowerCase().includes(query) ||
        n.arabic.includes(query) ||
        String(n.id) === query
    );
  }, [debouncedQ]);

  // audio controls
  const playName = React.useCallback(
    (name: NameOfAllah, autoplayNext = false) => {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const a = audioRef.current;
      if (playingId !== name.id) {
        a.src = name.audio;
        a.currentTime = 0;
        setPlayingId(name.id);
        setAutoPlayNext(autoplayNext);
        setProgress(0);
        setCurrent(0);
        setDuration(0);
      }
      setIsPlaying(true);
      a.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    },
    [playingId]
  );

  const togglePlay = React.useCallback(() => {
    const a = audioRef.current;
    if (!a || playingId === null) return;
    if (!a.paused) {
      a.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      a.play().catch(() => setIsPlaying(false));
    }
  }, [playingId]);

  const stopAll = React.useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    setIsPlaying(false);
    setPlayingId(null);
    setProgress(0);
    setCurrent(0);
  }, []);

  // event listeners — attached ONCE on mount. Uses refs to read latest values.
  const autoPlayNextRef = React.useRef(autoPlayNext);
  const playingIdRef = React.useRef(playingId);
  const playNameRef = React.useRef(playName);
  React.useEffect(() => {
    autoPlayNextRef.current = autoPlayNext;
  }, [autoPlayNext]);
  React.useEffect(() => {
    playingIdRef.current = playingId;
  }, [playingId]);
  React.useEffect(() => {
    playNameRef.current = playName;
  }, [playName]);

  React.useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const a = audioRef.current;
    const onTime = () => {
      setCurrent(a.currentTime);
      setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
    };
    const onMeta = () => setDuration(a.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnd = () => {
      setIsPlaying(false);
      // auto-play next using ref for latest value
      if (autoPlayNextRef.current && playingIdRef.current !== null) {
        const next = namesOfAllah.find(
          (n) => n.id === (playingIdRef.current ?? 0) + 1
        );
        if (next) {
          setTimeout(() => playNameRef.current(next, true), 200);
        } else {
          setProgress(0);
          setCurrent(0);
        }
      } else {
        setProgress(0);
        setCurrent(0);
      }
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("play", onPlay);
    a.addEventListener("playing", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("playing", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnd);
    };
  }, []); // attach once

  // cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playingName = playingId
    ? namesOfAllah.find((n) => n.id === playingId)
    : null;

  const playNext = () => {
    if (playingId === null) return;
    const next = namesOfAllah.find((n) => n.id === playingId + 1);
    if (next) playName(next, autoPlayNext);
  };
  const playPrev = () => {
    if (playingId === null || playingId <= 1) return;
    const prev = namesOfAllah.find((n) => n.id === playingId - 1);
    if (prev) playName(prev, autoPlayNext);
  };

  const fmtTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-amber-500/10 p-6 sm:p-8"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative">
          <Badge className="mb-3 gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15">
            <BookOpen className="h-3 w-3" />
            আসমাউল হুসনা
          </Badge>
          <h1 className="font-bengali text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            আল্লাহর ৯৯ নাম
          </h1>
          <p className="mt-2 max-w-2xl font-bengali text-sm text-muted-foreground sm:text-base">
            মহান আল্লাহর সর্বোচ্চ নাম ও তাঁর ৯৯টি সুন্দর নাম (আসমাউল হুসনা)।
            প্রতিটি নামের অর্থ ও অডিও শুনে শিখুন, মুখস্থ করুন।
          </p>

          {/* Hadith */}
          <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5">
            <p className="font-bengali text-sm leading-relaxed text-foreground/90">
              আবূ হুরাইরাহ (রাঃ) হতে বর্ণিত। তিনি বলেন, আল্লাহ্‌ তা‘আলার
              নিরানব্বই নাম আছে, এক কম একশত নাম। যে ব্যক্তি এ (নাম) গুলোর
              হিফাযাত করবে সে জান্নাতে প্রবেশ করবে। আল্লাহ্‌ বিজোড়। তিনি বিজোড়
              পছন্দ করেন।
            </p>
            <p className="mt-2 font-bengali text-[11px] text-muted-foreground">
              সহীহ বুখারী — হাদিস ৬৪১০
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="নাম বা অর্থ দিয়ে খুঁজুন..."
          className="font-bengali pl-9"
        />
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bengali text-muted-foreground">
        <span>
          মোট {filtered.length.toLocaleString("bn-BD")} টি নাম দেখানো হচ্ছে
          {filtered.length !== 99 && ` (মোট ৯৯ এর মধ্যে)`} · সর্বোচ্চ নাম “আল্লাহ” আলাদা
        </span>
        {autoPlayNext && (
          <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            ক্রমিক চালানো চালু
          </Badge>
        )}
      </div>

      {/* Supreme name — আল্লাহ (no number, no audio) */}
      {(!debouncedQ.trim() ||
        supremeName.transliteration.includes(debouncedQ) ||
        supremeName.meaning.includes(debouncedQ) ||
        supremeName.arabic.includes(debouncedQ)) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-1"
        >
          <Card className="relative overflow-hidden border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-teal-500/10 p-0 shadow-md">
            <div className="flex items-stretch">
              {/* Ism-e-Zat badge instead of number */}
              <div className="grid w-12 shrink-0 place-items-center bg-gradient-to-b from-amber-500 to-orange-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6L5.7 21l2.3-7.4-6-4.6h7.6z" />
                </svg>
              </div>
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-arabic text-3xl leading-tight text-foreground">
                      {supremeName.arabic}
                    </p>
                    <p className="mt-1 font-bengali text-base font-bold text-amber-700 dark:text-amber-400">
                      {supremeName.transliteration}
                    </p>
                    <p className="mt-0.5 font-bengali text-xs leading-snug text-muted-foreground">
                      {supremeName.meaning}
                    </p>
                  </div>
                  <Badge className="shrink-0 gap-1 border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20">
                    ইসমে যাত
                  </Badge>
                </div>
                <p className="mt-2 font-bengali text-[10px] italic text-muted-foreground">
                  সর্বোচ্চ নাম — সকল নামের মূল। এর কোনো নম্বর বা অডিও নেই।
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Grid of 99 names */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((name, idx) => {
          const isActive = playingId === name.id;
          return (
            <motion.div
              key={name.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(idx * 0.015, 0.3) }}
            >
              <Card
                className={cn(
                  "group relative overflow-hidden border-border/60 p-0 transition-all hover:-translate-y-0.5 hover:shadow-lg",
                  isActive && "border-emerald-500/60 ring-2 ring-emerald-500/30"
                )}
              >
                {/* number ribbon */}
                <div className="flex items-stretch">
                  <div
                    className={cn(
                      "grid w-12 shrink-0 place-items-center font-bengali text-lg font-bold text-white",
                      isActive
                        ? "bg-gradient-to-b from-emerald-600 to-teal-700"
                        : "bg-gradient-to-b from-emerald-500 to-teal-600"
                    )}
                  >
                    {name.id.toLocaleString("bn-BD")}
                  </div>
                  <div className="flex-1 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-arabic text-2xl leading-tight text-foreground">
                          {name.arabic}
                        </p>
                        <p className="mt-0.5 font-bengali text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          {name.transliteration}
                        </p>
                        <p className="mt-0.5 font-bengali text-xs leading-snug text-muted-foreground">
                          {name.meaning}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          isActive ? togglePlay() : playName(name)
                        }
                        aria-label={
                          isActive && isPlaying ? "বিরতি" : "অডিও চালান"
                        }
                        className={cn(
                          "grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full transition-all",
                          isActive
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                            : "bg-muted text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400"
                        )}
                      >
                        {isActive && isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4 translate-x-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                {/* progress bar when active */}
                {isActive && (
                  <div className="h-1 w-full bg-muted">
                    <div
                      className="h-full bg-emerald-500 transition-[width] duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="grid place-items-center p-12 text-center">
          <Search className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-2 font-bengali text-sm text-muted-foreground">
            কোনো নাম পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।
          </p>
        </Card>
      )}

      {/* Sticky mini player */}
      <AnimatePresence>
        {playingName && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl"
          >
            <div className="mx-auto flex max-w-5xl items-center gap-3 px-3 py-2.5 sm:px-6 sm:py-3">
              {/* info */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 font-bengali text-sm font-bold text-white">
                  {playingName.id.toLocaleString("bn-BD")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-arabic text-lg leading-tight text-foreground">
                    {playingName.arabic}
                  </p>
                  <p className="truncate font-bengali text-xs text-muted-foreground">
                    {playingName.transliteration} — {playingName.meaning}
                  </p>
                </div>
              </div>

              {/* controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={playPrev}
                  disabled={playingName.id <= 1}
                  className="h-9 w-9 cursor-pointer"
                  aria-label="আগের নাম"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  onClick={togglePlay}
                  className="h-10 w-10 cursor-pointer rounded-full bg-emerald-600 hover:bg-emerald-700"
                  aria-label={isPlaying ? "বিরতি" : "চালান"}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 translate-x-0.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={playNext}
                  disabled={playingName.id >= 99}
                  className="h-9 w-9 cursor-pointer"
                  aria-label="পরের নাম"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    playName(playingName, !autoPlayNext)
                  }
                  className={cn(
                    "h-9 w-9 cursor-pointer",
                    autoPlayNext && "text-emerald-600"
                  )}
                  aria-label="ক্রমিক চালানো টগল"
                  title={
                    autoPlayNext
                      ? "ক্রমিক চালানো বন্ধ করুন"
                      : "ক্রমিক চালানো চালু করুন"
                  }
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={stopAll}
                  className="h-9 w-9 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                  aria-label="বন্ধ করুন"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* progress */}
            <div className="h-0.5 w-full bg-muted">
              <div
                className="h-full bg-emerald-500 transition-[width] duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mx-auto flex max-w-5xl items-center justify-between px-3 pb-1 font-bengali text-[10px] text-muted-foreground sm:px-6">
              <span className="flex items-center gap-1">
                <RotateCcw className="h-2.5 w-2.5" />
                {fmtTime(current)}
              </span>
              <span>{fmtTime(duration)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
