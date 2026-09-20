"use client";

import { namazItems } from "@/lib/islamic-content";
import { CategoryIcon } from "@/components/app/icon-map";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { YouTubeAudioPlayer } from "@/components/app/youtube-audio-player";
import { Clock, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function NamazView() {
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
            <BookOpen className="h-3 w-3" />
            নামাজ শিক্ষা
          </Badge>
          <h1 className="font-bengali text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            পাঁচ ওয়াক্ত নামাজ পড়ার নিয়ম
          </h1>
          <p className="mt-2 max-w-2xl font-bengali text-sm text-muted-foreground sm:text-base">
            পাঁচ ওয়াক্ত ফরজ নামাজ ইসলামের দ্বিতীয় রুকন ও মুমিনের মিরাজ।
            প্রতিটি নামাজের নিয়ম ভিডিও সহ দেখুন ও শিখুন।
          </p>
        </div>
      </motion.div>

      {/* 5 prayer cards with embedded videos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {namazItems.map((namaz, idx) => (
          <motion.div
            key={namaz.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={
              namaz.id === "isha" ? "lg:col-span-2" : ""
            }
          >
            <Card className="overflow-hidden border-border/60 p-0">
              {/* header */}
              <div
                className={cn(
                  "flex items-center gap-3 bg-gradient-to-br p-4 text-white",
                  namaz.accent
                )}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur">
                  <CategoryIcon name={namaz.icon} className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bengali text-lg font-bold leading-tight sm:text-xl">
                    {namaz.name}
                  </h2>
                  <p className="mt-0.5 font-bengali text-xs text-white/85">
                    {namaz.rakat}
                  </p>
                </div>
                <Badge className="border-white/30 bg-white/20 text-white hover:bg-white/30">
                  <Clock className="mr-1 h-3 w-3" />
                  ওয়াক্ত
                </Badge>
              </div>

              <div className="space-y-3 p-4">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="mb-1 font-bengali text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    সময়
                  </p>
                  <p className="font-bengali text-xs text-foreground">
                    {namaz.time}
                  </p>
                </div>
                <p className="font-bengali text-xs leading-relaxed text-muted-foreground">
                  {namaz.description}
                </p>

                {/* full YouTube embed */}
                <YouTubeAudioPlayer
                  url={namaz.youtubeUrl}
                  title={namaz.name + " পড়ার নিয়ম"}
                  compact={false}
                />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
