"use client";

import { useAppStore } from "@/lib/store";
import { categories, getDuasByCategory } from "@/lib/dua-data";
import { CategoryIcon } from "@/components/app/icon-map";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Target, BookOpen, ArrowRight, Volume2, Sparkles, Shield, Clock, ExternalLink, Flame, TrendingUp, History } from "lucide-react";
import { RoundTasbih } from "@/components/app/round-tasbih";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { computeAmalStats } from "@/lib/amal-stats";

export function HomeView() {
  const goCategory = useAppStore((s) => s.goCategory);
  const goBlog = useAppStore((s) => s.goBlog);
  const goNamesOfAllah = useAppStore((s) => s.goNamesOfAllah);
  const goRuqyah = useAppStore((s) => s.goRuqyah);
  const goNamaz = useAppStore((s) => s.goNamaz);
  const counts = useAppStore((s) => s.counts);
  const tasbihCounts = useAppStore((s) => s.tasbihCounts);

  const stats = computeAmalStats(counts, tasbihCounts);

  const todayKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  })();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-amber-500/10 p-5 sm:p-7"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Left: text + stats */}
          <div>
            <Badge className="mb-3 gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15">
              আসসালামু আলাইকুম
            </Badge>
            <h1 className="font-bengali text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              আন-নূর
            </h1>
            <p className="mt-2 max-w-xl font-bengali text-sm text-muted-foreground sm:text-base">
              আপনার দুআ ও জিকির গুনে রাখুন। আরবি, অর্থ ও ফজিলত সহ সুন্দর কাউন্টার।
              আপনার আমল ব্রাউজারেই নিরাপদে সংরক্ষিত থাকে।
            </p>
          </div>

          {/* Right: Round Tasbih */}
          <div className="flex justify-center lg:justify-end">
            <RoundTasbih />
          </div>
        </div>
      </motion.section>

      {/* ====== আমলের ইতিহাস — স্মার্ট সারসংক্ষেপ (ক্যাটাগরির উপরে) ====== */}
      <AmalOverviewCard stats={stats} />

      {/* Categories */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bengali text-lg font-semibold text-foreground sm:text-xl">
            ক্যাটাগরি বাছুন
          </h2>
          <span className="font-bengali text-xs text-muted-foreground">
            ৫টি ক্যাটাগরি
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, idx) => {
            const duasList = getDuasByCategory(cat.id);
            const catTodayTotal = duasList.reduce((sum, dua) => {
              return sum + (counts[dua.id]?.[todayKey] ?? 0);
            }, 0);
            const catTotal = duasList.reduce((sum, dua) => {
              return (
                sum +
                Object.values(counts[dua.id] ?? {}).reduce((a, b) => a + b, 0)
              );
            }, 0);

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card
                  onClick={() => goCategory(cat.id)}
                  className="group relative cursor-pointer overflow-hidden border-border/60 p-0 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 bg-gradient-to-br p-4 text-white",
                      cat.color
                    )}
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 backdrop-blur">
                      <CategoryIcon name={cat.icon} className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bengali text-base font-bold leading-tight">
                        {cat.name}
                      </h3>
                      <p className="font-bengali text-xs text-white/80">
                        {duasList.length} টি দুআ
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 opacity-80 transition-transform group-hover:translate-x-1" />
                  </div>

                  <div className="space-y-3 p-4">
                    <p className="font-bengali text-xs leading-relaxed text-muted-foreground">
                      {cat.description}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bengali text-muted-foreground">
                        আজ:{" "}
                        <span className="font-semibold text-foreground">
                          {catTodayTotal.toLocaleString("bn-BD")}
                        </span>
                      </span>
                      <span className="font-bengali text-muted-foreground">
                        মোট:{" "}
                        <span className="font-semibold text-foreground">
                          {catTotal.toLocaleString("bn-BD")}
                        </span>
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {/* History card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: categories.length * 0.05 }}
          >
            <HistoryCard />
          </motion.div>
        </div>
      </section>

      {/* Ruqyah & Namaz section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bengali text-lg font-semibold text-foreground sm:text-xl">
            রুকইয়াহ ও নামাজ শিক্ষা
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Ruqyah card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              onClick={() => goRuqyah()}
              className="group relative h-full cursor-pointer overflow-hidden border-rose-500/30 p-0 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10"
            >
              <div className="relative flex items-center gap-4 bg-gradient-to-br from-rose-500 to-red-600 p-5 text-white">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                  <Shield className="h-7 w-7" />
                </span>
                <div className="relative flex-1">
                  <h3 className="font-bengali text-base font-bold sm:text-lg">
                    রুকইয়াহ
                  </h3>
                  <p className="mt-0.5 font-bengali text-xs text-white/85">
                    রিজিক, বদনজর, যাদু থেকে চিকিৎসা
                  </p>
                </div>
                <ChevronRight className="relative h-5 w-5 shrink-0 opacity-90 transition-transform group-hover:translate-x-1" />
              </div>
              <div className="p-5">
                <p className="font-bengali text-xs leading-relaxed text-muted-foreground">
                  রিজিকের বাধা দূর করা, বদনজর, হিংসা ও কালো যাদু থেকে মুক্তির
                  শক্তিশালী রুকইয়াহ। গোসলের নিয়ম সহ।
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge className="gap-1 border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/15">
                    <Shield className="h-3 w-3" />
                    রুকইয়াহ
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Volume2 className="h-3 w-3" />
                    ভিডিও সহ
                  </Badge>
                </div>
                <p className="mt-3 font-bengali text-[11px] italic text-muted-foreground">
                  সুস্থ করার একমাত্র মালিক মহান আল্লাহ। রুকইয়াহ শুধু একটি
                  উপকরণ।
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Namaz card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <Card
              onClick={() => goNamaz()}
              className="group relative h-full cursor-pointer overflow-hidden border-sky-500/30 p-0 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10"
            >
              <div className="relative flex items-center gap-4 bg-gradient-to-br from-sky-500 to-indigo-600 p-5 text-white">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                  <Clock className="h-7 w-7" />
                </span>
                <div className="relative flex-1">
                  <h3 className="font-bengali text-base font-bold sm:text-lg">
                    পাঁচ ওয়াক্ত নামাজ
                  </h3>
                  <p className="mt-0.5 font-bengali text-xs text-white/85">
                    পড়ার নিয়ম — ভিডিও সহ
                  </p>
                </div>
                <ChevronRight className="relative h-5 w-5 shrink-0 opacity-90 transition-transform group-hover:translate-x-1" />
              </div>
              <div className="p-5">
                <p className="font-bengali text-xs leading-relaxed text-muted-foreground">
                  ফজর, যোহর, আসর, মাগরিব ও এশা — পাঁচ ওয়াক্ত ফরজ নামাজ
                  পড়ার নিয়ম প্রতিটি আলাদা ভিডিও সহ।
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge className="gap-1 border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/15">
                    <Clock className="h-3 w-3" />
                    ৫ ওয়াক্ত
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Volume2 className="h-3 w-3" />
                    ফুল ভিডিও
                  </Badge>
                </div>
                <p className="mt-3 font-bengali text-[11px] italic text-muted-foreground">
                  নামাজ ইসলামের দ্বিতীয় রুকন ও মুমিনের মিরাজ।
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Knowledge section — 99 names + Blog */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bengali text-lg font-semibold text-foreground sm:text-xl">
            জ্ঞান ও শিক্ষা
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 99 Names card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              onClick={() => goNamesOfAllah()}
              className="group relative h-full cursor-pointer overflow-hidden border-emerald-500/30 p-0 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
            >
              <div className="relative flex items-center gap-4 bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-5 text-white">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                  <Volume2 className="h-7 w-7" />
                </span>
                <div className="relative flex-1">
                  <h3 className="font-bengali text-base font-bold sm:text-lg">
                    আল্লাহর ৯৯ নাম
                  </h3>
                  <p className="mt-0.5 font-bengali text-xs text-white/85">
                    আসমাউল হুসনা — অডিও সহ
                  </p>
                </div>
                <ChevronRight className="relative h-5 w-5 shrink-0 opacity-90 transition-transform group-hover:translate-x-1" />
              </div>
              <div className="p-5">
                <p className="font-bengali text-xs leading-relaxed text-muted-foreground">
                  আল্লাহর সর্বোচ্চ নাম ও ৯৯টি সুন্দর নাম (আসমাউল হুসনা)।
                  প্রতিটি নামের অর্থ ও অডিও শুনে শিখুন ও মুখস্থ করুন।
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15">
                    <Sparkles className="h-3 w-3" />
                    ৯৯ নাম + আল্লাহ
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Volume2 className="h-3 w-3" />
                    অডিও সহ
                  </Badge>
                </div>
                <p className="mt-3 font-bengali text-[11px] italic text-muted-foreground">
                  “যে ব্যক্তি এ (নাম) গুলোর হিফাযাত করবে সে জান্নাতে প্রবেশ
                  করবে।” — বুখারী ৬৪১০
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Blog card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <Card
              onClick={() => goBlog()}
              className="group relative h-full cursor-pointer overflow-hidden border-border/60 p-0 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10"
            >
              <div className="relative flex items-center gap-4 bg-gradient-to-br from-sky-500 to-cyan-600 p-5 text-white">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                  <BookOpen className="h-7 w-7" />
                </span>
                <div className="relative flex-1">
                  <h3 className="font-bengali text-base font-bold sm:text-lg">
                    ইসলামিক ব্লগ
                  </h3>
                  <p className="mt-0.5 font-bengali text-xs text-white/85">
                    আর্টিকেল ও জ্ঞান ভাণ্ডার
                  </p>
                </div>
                <ChevronRight className="relative h-5 w-5 shrink-0 opacity-90 transition-transform group-hover:translate-x-1" />
              </div>
              <div className="p-5">
                <p className="font-bengali text-xs leading-relaxed text-muted-foreground">
                  কুরআন, হাদিস ও ইসলামিক জ্ঞান ভিত্তিক আর্টিকেল। স্বয়ংক্রিয়
                  ইন্টারলিংকিং ও সম্পর্কিত লেখা সহ।
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge className="gap-1 border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/15">
                    <BookOpen className="h-3 w-3" />
                    আর্টিকেল
                  </Badge>
                  <Badge variant="secondary">সম্পর্কিত লেখা সহ</Badge>
                </div>
                <p className="mt-3 font-bengali text-[11px] italic text-muted-foreground">
                  প্রতিটি আর্টিকেলে স্বয়ংক্রিয় ৮-১০ টি সম্পর্কিত লেখার লিংক
                  যুক্ত থাকে।
                </p>
              </div>
            </Card>
          </motion.div>

          {/* ঐতিহ্যবাংলা — external website card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card
              onClick={() =>
                window.open("https://www.oitijhyobangla.com/", "_blank", "noopener,noreferrer")
              }
              className="group relative h-full cursor-pointer overflow-hidden border-border/60 p-0 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10"
            >
              <div className="relative flex items-center gap-4 bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                  <BookOpen className="h-7 w-7" />
                </span>
                <div className="relative flex-1">
                  <h3 className="font-bengali text-base font-bold sm:text-lg">
                    ঐতিহ্যবাংলা
                  </h3>
                  <p className="mt-0.5 font-bengali text-xs text-white/85">
                    ইতিহাস, স্থাপত্য ও ঐতিহ্য
                  </p>
                </div>
                <ChevronRight className="relative h-5 w-5 shrink-0 opacity-90 transition-transform group-hover:translate-x-1" />
              </div>
              <div className="p-5">
                <p className="font-bengali text-xs leading-relaxed text-muted-foreground">
                  বাংলাদেশ ও মুসলিম বিশ্বের ইতিহাস, স্থাপত্য ও ঐতিহ্য নিয়ে পড়ুন
                  নির্ভরযোগ্য বাংলা লেখা ও তথ্য। ইতিহাসের জানা-অজানা গল্প
                  আবিষ্কার করুন একসঙ্গে।
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15">
                    <BookOpen className="h-3 w-3" />
                    ইতিহাস
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <ExternalLink className="h-3 w-3" />
                    oitijhyobangla.com
                  </Badge>
                </div>
                <p className="mt-3 font-bengali text-[11px] italic text-muted-foreground">
                  বাংলাদেশ ও মুসলিম বিশ্বের ইতিহাসের জানা-অজানা গল্প আবিষ্কার করুন।
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function AmalOverviewCard({
  stats,
}: {
  stats: ReturnType<typeof computeAmalStats>;
}) {
  const goHistory = useAppStore((s) => s.goHistory);
  const num = (n: number) => n.toLocaleString("bn-BD");
  const dayLabels = ["শ", "সো", "ম", "ম", "ব", "শু", "শ"];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-emerald-500/10 p-5 sm:p-6"
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge className="mb-2.5 gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15">
              <History className="h-3 w-3" />
              আমলের ইতিহাস
            </Badge>
            <h2 className="font-bengali text-lg font-bold text-foreground sm:text-xl">
              আপনার আমলের সারসংক্ষেপ
            </h2>
            <p className="mt-0.5 font-bengali text-xs text-muted-foreground">
              দুআ ও তসবিহ — সব গুনতির হিসাব এক জায়গায়।
            </p>
          </div>
          <button
            onClick={goHistory}
            className="group flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-amber-500/30 bg-background/70 px-3 py-1.5 font-bengali text-[11px] font-bold text-amber-700 backdrop-blur transition-colors hover:bg-amber-500/10 dark:text-amber-300"
          >
            বিস্তারিত
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* স্ট্যাট টাইল */}
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
          <OverviewStat label="মোট আমল" value={num(stats.grandTotal)} color="text-emerald-600 dark:text-emerald-400" />
          <OverviewStat label="আজকের" value={num(stats.todayTotal)} color="text-amber-600 dark:text-amber-400" />
          <OverviewStat label="দিন গণনা" value={num(stats.totalDays)} color="text-sky-600 dark:text-sky-400" />
          <OverviewStat label="গড়/দিন" value={num(stats.avgPerDay)} color="text-teal-600 dark:text-teal-400" />
          <OverviewStat label="ধারাবাহিকতা" value={`${num(stats.streak)} দিন`} color="text-rose-600 dark:text-rose-400" icon={<Flame className="h-3 w-3" />} />
        </div>

        {/* শেষ ৭ দিনের অ্যাক্টিভিটি */}
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-border/50 bg-background/60 px-3 py-2.5 backdrop-blur">
          <span className="flex shrink-0 items-center gap-1 font-bengali text-[10px] font-semibold text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            শেষ ৭ দিন
          </span>
          <div className="flex min-w-0 flex-1 items-end justify-between gap-1 sm:gap-1.5">
            {stats.last7.map((d, i) => {
              const dayIdx = new Date(d.dateKey + "T00:00:00").getDay();
              const height = d.total > 0 ? Math.min(24, 8 + Math.log10(d.total + 1) * 8) : 3;
              return (
                <button
                  key={d.dateKey}
                  onClick={goHistory}
                  title={`${d.dateKey} — ${num(d.total)} বার`}
                  className="group flex cursor-pointer flex-1 flex-col items-center gap-1"
                >
                  <span
                    style={{ height: `${height}px` }}
                    className={cn(
                      "w-full max-w-[26px] rounded-full transition-all group-hover:opacity-80",
                      d.total > 0
                        ? "bg-gradient-to-t from-amber-500 to-emerald-500"
                        : "bg-muted-foreground/20"
                    )}
                  />
                  <span
                    className={cn(
                      "font-bengali text-[9px]",
                      i === 6 ? "font-bold text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                    )}
                  >
                    {dayLabels[dayIdx]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function OverviewStat({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/70 px-2 py-2.5 text-center backdrop-blur">
      <p className={cn("flex items-center justify-center gap-0.5 font-bengali text-base font-bold sm:text-lg", color)}>
        {icon}
        {value}
      </p>
      <p className="font-bengali text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function HistoryCard() {
  const goHistory = useAppStore((s) => s.goHistory);
  return (
    <Card
      onClick={goHistory}
      className="group flex cursor-pointer flex-col justify-between overflow-hidden border-border/60 p-5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10"
    >
      <div className="flex items-start justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <Target className="h-6 w-6" />
        </span>
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
      <div className="mt-4">
        <h3 className="font-bengali text-base font-bold text-foreground">
          আমলের ইতিহাস
        </h3>
        <p className="mt-1 font-bengali text-xs leading-relaxed text-muted-foreground">
          তারিখ অনুযায়ী আপনার সব আমলের হিসাব দেখুন।
        </p>
      </div>
    </Card>
  );
}
