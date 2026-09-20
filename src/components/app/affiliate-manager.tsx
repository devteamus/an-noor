"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Loader2,
  Trash2,
  Plus,
  BookOpen,
  UtensilsCrossed,
  ExternalLink,
  Link2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { formatBengaliNumber } from "@/lib/blog-utils";
import { cn } from "@/lib/utils";

const MAX_PER_CATEGORY = 5;

interface AffiliateProduct {
  id: string;
  url: string;
  category: "book" | "food";
  title: string;
  image: string | null;
  price: string | null;
  createdAt: string;
}

/**
 * Admin affiliate manager: book/food category tabs (max 5 each),
 * URL input + auto-preview, product list with delete.
 */
export function AffiliateManager() {
  return (
    <Tabs defaultValue="book" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="book" className="gap-1.5 font-bengali">
          <BookOpen className="h-4 w-4" />
          বই
        </TabsTrigger>
        <TabsTrigger value="food" className="gap-1.5 font-bengali">
          <UtensilsCrossed className="h-4 w-4" />
          খাদ্য
        </TabsTrigger>
      </TabsList>

      <TabsContent value="book">
        <CategoryManager category="book" title="বই" />
      </TabsContent>
      <TabsContent value="food">
        <CategoryManager category="food" title="খাদ্য" />
      </TabsContent>
    </Tabs>
  );
}

function CategoryManager({
  category,
  title,
}: {
  category: "book" | "food";
  title: string;
}) {
  return (
    <div className="space-y-4">
      <AddAffiliateForm category={category} title={title} />
      <AffiliateList category={category} title={title} />
    </div>
  );
}

function AddAffiliateForm({
  category,
  title,
}: {
  category: "book" | "food";
  title: string;
}) {
  const { toast } = useToast();
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    fetch(`/api/affiliate?category=${category}`)
      .then((r) => r.json())
      .then((d) => setCount(d.products?.length || 0))
      .catch(() => {});
  }, [category, refreshKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "যুক্ত করতে সমস্যা");
      toast({
        title: "সফল!",
        description: "প্রোডাক্ট যুক্ত হয়েছে ও প্রিভিউ ফেচ হয়েছে।",
      });
      setUrl("");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast({
        title: "ব্যর্থ",
        description: err instanceof Error ? err.message : "সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const remaining = MAX_PER_CATEGORY - count;
  const atMax = count >= MAX_PER_CATEGORY;

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bengali text-base font-bold text-foreground">
            নতুন {title} প্রোডাক্ট
          </h3>
          <Badge
            className={cn(
              "px-2 py-0.5 text-[10px]",
              atMax
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            )}
          >
            {formatBengaliNumber(count)} / {formatBengaliNumber(MAX_PER_CATEGORY)}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`url-${category}`} className="font-bengali">
            প্রোডাক্ট URL
          </Label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={`url-${category}`}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={atMax || loading}
              className="font-mono pl-9 text-sm"
              placeholder="https://www.rokomari.com/product/..."
            />
          </div>
          <p className="font-bengali text-[11px] text-muted-foreground">
            URL দিলে সিস্টেম স্বয়ংক্রিয়ভাবে শিরোনাম ও ইমেজ ফেচ করবে (og:title / og:image)।
          </p>
        </div>

        {atMax && (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-2.5">
            <p className="font-bengali text-[11px] text-destructive">
              এই ক্যাটাগরিতে সর্বোচ্চ {formatBengaliNumber(MAX_PER_CATEGORY)}
              টি প্রোডাক্ট রাখা যায়। নতুন করে যুক্ত করতে একটি মুছুন।
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || atMax || !url.trim()}
          className="w-full gap-2 font-bengali cursor-pointer sm:w-auto"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {loading ? "ফেচ হচ্ছে..." : `যুক্ত করুন (${formatBengaliNumber(Math.max(0, remaining))} স্লট বাকি)`}
        </Button>
      </form>
    </Card>
  );
}

function AffiliateList({
  category,
  title,
}: {
  category: "book" | "food";
  title: string;
}) {
  const { toast } = useToast();
  const [products, setProducts] = React.useState<AffiliateProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch(`/api/affiliate?category=${category}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, [category]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (p: AffiliateProduct) => {
    if (!confirm(`"${p.title}" মুছে ফেলতে চান?`)) return;
    setDeleting(p.id);
    try {
      const res = await fetch(`/api/affiliate/${p.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("মুছতে সমস্যা");
      toast({ title: "প্রোডাক্ট মুছে ফেলা হয়েছে" });
      load();
    } catch {
      toast({ title: "ব্যর্থ", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-5">
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="grid place-items-center p-10 text-center">
        <BookOpen className="h-10 w-10 text-muted-foreground/50" />
        <p className="mt-2 font-bengali text-sm text-muted-foreground">
          এই ক্যাটাগরিতে এখনও কোনো {title} প্রোডাক্ট নেই।
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bengali text-base font-bold text-foreground">
          যুক্ত {title} ({formatBengaliNumber(products.length)})
        </h3>
      </div>
      <div className="space-y-2">
        {products.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:bg-accent/30"
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
              {p.image ? (
                 
                <img
                  src={p.image}
                  alt=""
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <Link2 className="h-4 w-4 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bengali line-clamp-1 text-sm font-semibold text-foreground">
                {p.title}
              </p>
              <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                {p.url}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <a
                  href={p.url}
                  target="_blank"
                  rel="sponsored nofollow"
                  aria-label="দেখুন"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDelete(p)}
                disabled={deleting === p.id}
                aria-label="মুছুন"
              >
                {deleting === p.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
