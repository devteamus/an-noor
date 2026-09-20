"use client";

import * as React from "react";
import { useAppStore } from "@/lib/store";
import { BlogCard } from "@/components/app/blog-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  Newspaper,
} from "lucide-react";
import type { BlogListResponse, BlogListItem, CategoryInfo } from "@/lib/types";
import { formatBengaliNumber } from "@/lib/blog-utils";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BlogView({
  initialPage = 1,
  initialCategory,
}: {
  initialPage?: number;
  initialCategory?: string;
}) {
  const goBlogPost = useAppStore((s) => s.goBlogPost);
  const goBlog = useAppStore((s) => s.goBlog);

  const [page, setPage] = React.useState(initialPage);
  const [category, setCategory] = React.useState(initialCategory || "");
  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [data, setData] = React.useState<BlogListResponse | null>(null);
  const [categories, setCategories] = React.useState<CategoryInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  // debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  // load categories once
  React.useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  // load blogs when page/category/search changes
  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (category) params.set("category", category);
    if (debouncedQ) params.set("q", debouncedQ);
    fetch(`/api/blogs?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => active && setError("ব্লগ লোডে সমস্যা হয়েছে।"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page, category, debouncedQ]);

  const handleCategoryClick = (slug: string) => {
    setCategory((prev) => (prev === slug ? "" : slug));
    setPage(1);
    goBlog(1, slug || undefined);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    goBlog(newPage, category || undefined);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-amber-500/10 p-6 sm:p-8"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative">
          <Badge className="mb-3 gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15">
            <BookOpen className="h-3 w-3" />
            ইসলামিক ব্লগ
          </Badge>
          <h1 className="font-bengali text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            ইসলামিক আর্টিকেল ও জ্ঞান
          </h1>
          <p className="mt-2 max-w-xl font-bengali text-sm text-muted-foreground sm:text-base">
            কুরআন, হাদিস ও ইসলামিক জ্ঞান ভিত্তিক আর্টিকেল। প্রতিটি আর্টিকেলে
            স্বয়ংক্রিয়ভাবে সম্পর্কিত লেখার লিংক যুক্ত থাকে।
          </p>
          {data && (
            <p className="mt-3 font-bengali text-xs text-muted-foreground">
              মোট {formatBengaliNumber(data.total)} টি আর্টিকেল · পৃষ্ঠা{" "}
              {formatBengaliNumber(page)} / {formatBengaliNumber(data.totalPages)}
            </p>
          )}
        </div>
      </motion.div>

      {/* Search + categories */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="আর্টিকেল খুঁজুন..."
            className="font-bengali pl-9"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryClick("")}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 font-bengali text-xs transition-colors",
                !category
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-border bg-card hover:bg-accent"
              )}
            >
              সব
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCategoryClick(c.slug)}
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1.5 font-bengali text-xs transition-colors",
                  category === c.slug
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-border bg-card hover:bg-accent"
                )}
              >
                {c.name}
                <span className="ml-1 opacity-70">
                  ({formatBengaliNumber(c.count)})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {error ? (
        <Card className="p-8 text-center">
          <p className="font-bengali text-sm text-destructive">{error}</p>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden p-0">
              <Skeleton className="aspect-[16/10] w-full" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : data && data.blogs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.blogs.map((blog: BlogListItem, idx) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              index={idx}
              onOpen={goBlogPost}
            />
          ))}
        </div>
      ) : (
        <Card className="grid place-items-center p-12 text-center">
          <Newspaper className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-3 font-bengali text-sm font-medium text-foreground">
            কোনো আর্টিকেল পাওয়া যায়নি
          </p>
          <p className="mt-1 font-bengali text-xs text-muted-foreground">
            {debouncedQ
              ? "অন্য শব্দ দিয়ে খুঁজে দেখুন।"
              : "শীঘ্রই নতুন আর্টিকেল আসছে।"}
          </p>
        </Card>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="gap-1 font-bengali cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            আগের
          </Button>
          <div className="flex items-center gap-1">
            {getPageNumbers(page, data.totalPages).map((p, i) =>
              p === "..." ? (
                <span
                  key={`e${i}`}
                  className="px-2 font-bengali text-sm text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(p as number)}
                  className={cn(
                    "h-8 w-8 cursor-pointer font-bengali text-xs",
                    p === page &&
                      "bg-emerald-600 text-white hover:bg-emerald-700"
                  )}
                >
                  {formatBengaliNumber(p as number)}
                </Button>
              )
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= data.totalPages}
            className="gap-1 font-bengali cursor-pointer"
          >
            পরের
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  const out: (number | string)[] = [];
  const push = (n: number) => out.push(n);
  if (total <= 7) {
    for (let i = 1; i <= total; i++) push(i);
    return out;
  }
  push(1);
  if (current > 3) out.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) push(i);
  if (current < total - 2) out.push("...");
  push(total);
  return out;
}
