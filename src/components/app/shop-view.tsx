"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  PackageOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatBengaliNumber } from "@/lib/blog-utils";
import { cn } from "@/lib/utils";

export interface ShopProduct {
  id: string;
  productId: string;
  title: string;
  image: string | null;
  price: string | null;
  productUrl: string;
  affiliateUrl: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

interface ShopListResponse {
  products: ShopProduct[];
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
}

interface ShopViewProps {
  /** Initial page (from URL sync). Default 1. */
  initialPage?: number;
  /** Called when the user navigates to a different page (for URL sync). */
  onPageChange?: (page: number) => void;
}

export function ShopView({
  initialPage = 1,
  onPageChange,
}: ShopViewProps) {
  const [page, setPage] = React.useState(initialPage);
  const [data, setData] = React.useState<ShopListResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetch(`/api/shop?page=${page}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => active && setError("প্রোডাক্ট লোডে সমস্যা হয়েছে।"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    onPageChange?.(newPage);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-amber-500/10 p-6 sm:p-8"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative">
          <Badge className="mb-3 gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15">
            <ShoppingBag className="h-3 w-3" />
            ইসলামিক বই
          </Badge>
          <h1 className="font-bengali text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Islamic Books
          </h1>
          <p className="mt-2 max-w-2xl font-bengali text-sm text-muted-foreground sm:text-base">
            নির্বাচিত ইসলামিক বই ও প্রোডাক্ট।{" "}
            <span className="text-foreground/70">কিনুন</span> বাটনে ক্লিক
            করলে আপনি নিরাপদ রকমারি স্টোরে যাবেন।
          </p>
          {data && (
            <p className="mt-3 font-bengali text-xs text-muted-foreground">
              মোট {formatBengaliNumber(data.total)} টি প্রোডাক্ট · পৃষ্ঠা{" "}
              {formatBengaliNumber(page)} /{" "}
              {formatBengaliNumber(data.totalPages)}
            </p>
          )}
        </div>
      </motion.div>

      {/* Grid */}
      {error ? (
        <Card className="p-8 text-center">
          <p className="font-bengali text-sm text-destructive">{error}</p>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden p-0">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-2 p-3 sm:p-4">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : data && data.products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.products.map((p: ShopProduct, idx) => (
            <ShopProductCard key={p.id} product={p} index={idx} />
          ))}
        </div>
      ) : (
        <Card className="grid place-items-center p-12 text-center">
          <PackageOpen className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-3 font-bengali text-sm font-medium text-foreground">
            এখনও কোনো প্রোডাক্ট নেই
          </p>
          <p className="mt-1 font-bengali text-xs text-muted-foreground">
            শীঘ্রই নতুন ইসলামিক বই আসছে।
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

function ShopProductCard({
  product,
  index,
}: {
  product: ShopProduct;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
    >
      <Card className="group flex h-full flex-col overflow-hidden p-0 transition-all hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5">
        {/* Image — fixed square area, object-contain for book covers */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
          {product.image ? (
             
            <img
              src={product.image}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-contain p-2 transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
          <h3
            className="font-bengali line-clamp-2 text-sm font-semibold leading-snug text-foreground"
            title={product.title}
          >
            {product.title}
          </h3>

          <div className="mt-auto flex items-center justify-between gap-2">
            {product.price ? (
              <span className="font-bengali text-base font-bold text-emerald-700 dark:text-emerald-400">
                ৳{product.price}
              </span>
            ) : (
              <span className="font-bengali text-xs text-muted-foreground">
                মূল্য নেই
              </span>
            )}
          </div>

          <Button
            asChild
            size="sm"
            className="mt-1 w-full gap-1.5 font-bengali cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <a
              href={product.affiliateUrl || product.productUrl}
              target="_blank"
              rel="sponsored nofollow"
            >
              কিনুন
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </Card>
    </motion.div>
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
