"use client";

import { ruqyahItems, gosolRules } from "@/lib/islamic-content";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { YouTubeAudioPlayer } from "@/components/app/youtube-audio-player";
import {
  Shield,
  Droplets,
  AlertCircle,
  CheckCircle2,
  Heart,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function RuqyahView() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-amber-500/10 p-6 sm:p-8"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative">
          <Badge className="mb-3 gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15">
            <Shield className="h-3 w-3" />
            রুকইয়াহ
          </Badge>
          <h1 className="font-bengali text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            রুকইয়াহ — কুরআন ও দুআ দ্বারা চিকিৎসা
          </h1>
          <p className="mt-2 max-w-2xl font-bengali text-sm text-muted-foreground sm:text-base">
            রিজিকের বাধা দূর করা, বদনজর, হিংসা ও কালো যাদু থেকে মুক্তির জন্য
            শক্তিশালী রুকইয়াহ। মনযোগ দিয়ে শুনুন। সুস্থ করার একমাত্র মালিক
            মহান আল্লাহ।
          </p>
        </div>
      </motion.div>

      {/* Ruqyah items */}
      <div className="space-y-4">
        {ruqyahItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <Card className="overflow-hidden border-border/60 p-0">
              {/* header */}
              <div
                className={cn(
                  "flex items-center gap-3 bg-gradient-to-br p-4 text-white",
                  item.accent
                )}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur">
                  <Sparkles className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bengali text-base font-bold leading-tight sm:text-lg">
                    {item.title}
                  </h2>
                  <p className="mt-0.5 font-bengali text-xs text-white/85">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* audio only (compact player) */}
              <div className="p-4">
                <div className="mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <p className="mb-2 flex items-center gap-1.5 font-bengali text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="h-3 w-3" />
                    রুকইয়াহ অডিও শুনুন
                  </p>
                  <YouTubeAudioPlayer
                    url={item.youtubeUrl}
                    title={item.title}
                    compact={true}
                    accentColor={item.accent}
                  />
                </div>

                {/* note */}
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <div className="mb-1 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <p className="font-bengali text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                      নিয়ত ও সতর্কতা
                    </p>
                  </div>
                  <p className="font-bengali text-xs leading-relaxed text-foreground/90">
                    {item.note}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Gosol rules */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden border-sky-500/30 p-0">
          <div className="flex items-center gap-3 bg-gradient-to-br from-sky-500 to-cyan-600 p-5 text-white">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur">
              <Droplets className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h2 className="font-bengali text-lg font-bold sm:text-xl">
                {gosolRules.title}
              </h2>
            </div>
          </div>
          <div className="space-y-4 p-5">
            <p className="font-bengali text-sm leading-relaxed text-foreground/90">
              {gosolRules.intro}
            </p>

            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <ol className="space-y-2">
                {gosolRules.rules.map((rule, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 font-bengali text-sm text-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <p className="font-bengali text-sm font-bold text-amber-700 dark:text-amber-300">
                  লক্ষণীয়
                </p>
              </div>
              <ul className="space-y-1.5">
                {gosolRules.cautions.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 font-bengali text-xs leading-relaxed text-foreground/90"
                  >
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Final reminder */}
      <Card className="flex items-start gap-3 border-emerald-500/30 bg-emerald-500/5 p-5">
        <Heart className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <p className="font-bengali text-sm leading-relaxed text-foreground/90">
          সুস্থ করার একমাত্র মালিক মহান আল্লাহ। রুকইয়াহ শুধুমাত্র একটি
          উপকরণ ও আমল। খাঁটি নিয়তে আল্লাহর কাছে সাহায্য চান, তিনি নিশ্চয়ই
          কবুল করবেন। আমিন।
        </p>
      </Card>
    </div>
  );
}
