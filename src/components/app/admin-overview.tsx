"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  FileText,
  CheckCircle2,
  Clock,
  Layers,
  TrendingUp,
  Calendar,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { formatBengaliNumber } from "@/lib/blog-utils";
import type { AnalyticsData } from "@/lib/types";
import { cn } from "@/lib/utils";

export function OverviewTab() {
  const goBlogPost = useAppStore((s) => s.goBlogPost);
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const load = React.useCallback(() => {
    setLoading(true);
    setError("");
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("অ্যানালিটিক্স লোডে সমস্যা হয়েছে।"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="grid place-items-center p-10 text-center">
        <p className="font-bengali text-sm text-destructive">{error}</p>
        <Button onClick={load} className="mt-3 font-bengali">
          আবার চেষ্টা করুন
        </Button>
      </Card>
    );
  }

  const maxDaily = Math.max(1, ...data.dailySeries.map((d) => d.views));

  return (
    <div className="space-y-5">
      {/* refresh */}
      <div className="flex items-center justify-between">
        <h2 className="font-bengali text-base font-bold text-foreground sm:text-lg">
          ওভারভিউ ও অ্যানালিটিক্স
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          className="gap-1.5 font-bengali cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          রিফ্রেশ
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={FileText}
          label="মোট পোস্ট"
          value={data.totals.posts}
          color="from-sky-500 to-cyan-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="পাবলিশড"
          value={data.totals.published}
          color="from-emerald-500 to-teal-600"
        />
        <StatCard
          icon={Clock}
          label="সিডিউলড"
          value={data.totals.scheduled}
          color="from-amber-500 to-orange-600"
        />
        <StatCard
          icon={Eye}
          label="মোট ভিউজ"
          value={data.totals.views}
          color="from-violet-500 to-purple-600"
        />
        <StatCard
          icon={Layers}
          label="ড্রাফট"
          value={data.totals.drafts}
          color="from-rose-500 to-red-600"
        />
      </div>

      {/* Views range cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <RangeCard label="শেষ ৭ দিন" value={data.viewsRange.last7d} highlight />
        <RangeCard label="শেষ ১৫ দিন" value={data.viewsRange.last15d} />
        <RangeCard label="শেষ ৩০ দিন" value={data.viewsRange.last30d} />
      </div>

      {/* Daily chart */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-bengali text-sm font-bold text-foreground">
            গত ৩০ দিনের ভিউজ
          </h3>
        </div>
        <div className="flex h-48 items-end gap-1 overflow-x-auto custom-scroll">
          {data.dailySeries.map((d, idx) => {
            const h = (d.views / maxDaily) * 100;
            const day = new Date(d.date);
            const isLast = idx === data.dailySeries.length - 1;
            return (
              <div
                key={d.date}
                className="group relative flex min-w-[8px] flex-1 flex-col items-center gap-1"
                title={`${d.date}: ${d.views} ভিউজ`}
              >
                <span className="font-bengali text-[9px] font-semibold text-foreground opacity-0 group-hover:opacity-100">
                  {d.views > 0 ? formatBengaliNumber(d.views) : ""}
                </span>
                <div className="flex w-full flex-1 items-end justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(h, d.views > 0 ? 3 : 0)}%` }}
                    transition={{ duration: 0.4, delay: idx * 0.01 }}
                    className={cn(
                      "w-full rounded-t",
                      isLast
                        ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                        : d.views > 0
                          ? "bg-gradient-to-t from-emerald-500/70 to-emerald-400/70"
                          : "bg-transparent"
                    )}
                  />
                </div>
                <span className="font-bengali text-[8px] text-muted-foreground">
                  {day.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Two columns: top posts + categories */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top posts */}
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-bengali text-sm font-bold text-foreground">
              সর্বাধিক দেখা পোস্ট
            </h3>
          </div>
          {data.topPosts.length === 0 ? (
            <p className="py-6 text-center font-bengali text-xs text-muted-foreground">
              কোনো ডেটা নেই।
            </p>
          ) : (
            <ul className="space-y-2">
              {data.topPosts.map((p, idx) => (
                <li key={p.id}>
                  <button
                    onClick={() => goBlogPost(p.slug)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent/40"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted font-bengali text-xs font-bold text-muted-foreground">
                      {formatBengaliNumber(idx + 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bengali text-xs font-semibold text-foreground">
                        {p.title}
                      </span>
                      <span className="flex items-center gap-1 font-bengali text-[10px] text-muted-foreground">
                        <Eye className="h-2.5 w-2.5" />
                        {formatBengaliNumber(p.views)} ভিউজ
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Categories */}
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-bengali text-sm font-bold text-foreground">
              ক্যাটাগরি অনুযায়ী পোস্ট ও ভিউজ
            </h3>
          </div>
          {data.categories.length === 0 ? (
            <p className="py-6 text-center font-bengali text-xs text-muted-foreground">
              কোনো ক্যাটাগরি নেই।
            </p>
          ) : (
            <ul className="space-y-2.5">
              {data.categories.slice(0, 8).map((c) => {
                const maxV = Math.max(
                  1,
                  ...data.categories.map((x) => x.views)
                );
                const pct = (c.views / maxV) * 100;
                return (
                  <li key={c.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-bengali text-xs font-medium text-foreground">
                        {c.name}
                      </span>
                      <span className="shrink-0 font-bengali text-[10px] text-muted-foreground">
                        {formatBengaliNumber(c.posts)} পোস্ট ·{" "}
                        {formatBengaliNumber(c.views)} ভিউজ
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="overflow-hidden border-border/60 p-0">
        <div className={cn("flex items-center gap-2 bg-gradient-to-br p-3 text-white", color)}>
          <Icon className="h-4 w-4 shrink-0" />
          <span className="font-bengali text-[11px] font-medium leading-tight">
            {label}
          </span>
        </div>
        <div className="p-3">
          <p className="font-bengali text-2xl font-bold tabular-nums text-foreground">
            {formatBengaliNumber(value)}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

function RangeCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card
      className={cn(
        "p-4 transition-colors",
        highlight && "border-emerald-500/40 bg-emerald-500/5"
      )}
    >
      <div className="flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-bengali text-xs text-muted-foreground">{label}</span>
      </div>
      <p
        className={cn(
          "mt-1.5 font-bengali text-2xl font-bold tabular-nums",
          highlight ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
        )}
      >
        {formatBengaliNumber(value)}
      </p>
      <p className="font-bengali text-[10px] text-muted-foreground">ভিউজ</p>
    </Card>
  );
}
