"use client";

import { useAppStore } from "@/lib/store";
import { getCategoryById, getDuasByCategory } from "@/lib/dua-data";
import { CategoryIcon } from "@/components/app/icon-map";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, BookOpen, Target } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function CategoryView({ categoryId }: { categoryId: string }) {
  const category = getCategoryById(categoryId);
  const goCounter = useAppStore((s) => s.goCounter);
  const goHome = useAppStore((s) => s.goHome);
  const goCategory = useAppStore((s) => s.goCategory);
  const counts = useAppStore((s) => s.counts);

  if (!category) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <p className="font-bengali text-muted-foreground">ক্যাটাগরি পাওয়া যায়নি।</p>
        <Button onClick={goHome} className="mt-4 font-bengali">
          হোমে ফিরুন
        </Button>
      </div>
    );
  }

  const duasList = getDuasByCategory(categoryId);

  const todayKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  })();

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <div className="space-y-4">
        <nav className="flex items-center gap-1.5 text-xs font-bengali text-muted-foreground">
          <button
            onClick={goHome}
            className="cursor-pointer hover:text-foreground"
          >
            হোম
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{category.name}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-lg sm:p-7",
            category.color
          )}
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
              <CategoryIcon name={category.icon} className="h-8 w-8" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-bengali text-xl font-bold sm:text-2xl">
                {category.name}
              </h1>
              <p className="mt-1 font-bengali text-sm text-white/85">
                {category.description}
              </p>
              <Badge className="mt-3 border-white/30 bg-white/15 text-white hover:bg-white/20">
                {duasList.length} টি দুআ
              </Badge>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Dua list */}
      <div className="space-y-3">
        {duasList.map((dua, idx) => {
          const todayCount = counts[dua.id]?.[todayKey] ?? 0;
          const total = Object.values(counts[dua.id] ?? {}).reduce(
            (a, b) => a + b,
            0
          );
          const progress = Math.min(100, (todayCount / dua.target) * 100);
          const completed = todayCount >= dua.target;

          return (
            <motion.div
              key={dua.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
            >
              <Card
                onClick={() => goCounter(dua.id)}
                className="group cursor-pointer overflow-hidden border-border/60 p-0 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="flex items-stretch gap-0">
                  <div
                    className={cn(
                      "flex w-1.5 shrink-0 bg-gradient-to-b",
                      category.color
                    )}
                  />
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bengali text-base font-bold text-foreground sm:text-lg">
                            {dua.title}
                          </h3>
                          {completed && (
                            <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15">
                              <Target className="h-3 w-3" />
                              সম্পন্ন
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 font-arabic text-base text-foreground/80">
                          {dua.arabic.slice(0, 60)}
                          {dua.arabic.length > 60 ? "…" : ""}
                        </p>
                      </div>
                      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>

                    {/* Progress + counts */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between font-bengali text-xs">
                        <span className="text-muted-foreground">
                          আজ:{" "}
                          <span className="font-semibold text-foreground">
                            {todayCount.toLocaleString("bn-BD")}
                          </span>
                          <span className="text-muted-foreground/70">
                            {" "}
                            / {dua.target.toLocaleString("bn-BD")}
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          মোট:{" "}
                          <span className="font-semibold text-foreground">
                            {total.toLocaleString("bn-BD")}
                          </span>
                        </span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-1.5 bg-muted"
                        style={
                          {
                            background: "var(--muted)",
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-center pt-2">
        <Button
          variant="outline"
          onClick={() => goCategory(categoryId)}
          className="font-bengali opacity-0"
          tabIndex={-1}
          aria-hidden
        >
          <BookOpen className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
