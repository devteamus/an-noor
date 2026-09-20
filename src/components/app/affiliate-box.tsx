"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  BookOpen,
  UtensilsCrossed,
  PackageOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AffiliateProduct {
  id: string;
  url: string;
  category: "book" | "food";
  title: string;
  image: string | null;
  price: string | null;
  createdAt: string;
}

interface AffiliateBoxProps {
  /** Compact mode: smaller cards for mobile. Default false (full). */
  compact?: boolean;
}

/**
 * Blog sidebar: fetches /api/affiliate and shows two sections
 * (books + food) with product cards (image, title, price, "কিনুন").
 *
 * Has a compact mode for mobile where cards are tighter.
 */
export function AffiliateBox({ compact = false }: AffiliateBoxProps) {
  const [products, setProducts] = React.useState<AffiliateProduct[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    fetch("/api/affiliate")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setProducts(d.products || []);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const books = products.filter((p) => p.category === "book");
  const foods = products.filter((p) => p.category === "food");

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="overflow-hidden p-0">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-8 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return null; // hide the entire box if no affiliate products configured
  }

  return (
    <div className={cn("space-y-5", compact && "space-y-3")}>
      {books.length > 0 && (
        <AffiliateSection
          title="প্রিয় বই"
          icon={<BookOpen className="h-4 w-4" />}
          products={books}
          compact={compact}
        />
      )}
      {foods.length > 0 && (
        <AffiliateSection
          title="ইসলামিক খাদ্য"
          icon={<UtensilsCrossed className="h-4 w-4" />}
          products={foods}
          compact={compact}
        />
      )}
    </div>
  );
}

function AffiliateSection({
  title,
  icon,
  products,
  compact,
}: {
  title: string;
  icon: React.ReactNode;
  products: AffiliateProduct[];
  compact: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="text-emerald-600 dark:text-emerald-400">{icon}</span>
        <h4 className="font-bengali text-sm font-bold text-foreground">
          {title}
        </h4>
        <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
          {products.length}
        </Badge>
      </div>
      <div
        className={cn(
          "grid gap-2.5",
          compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
        )}
      >
        {products.map((p, idx) => (
          <AffiliateProductCard
            key={p.id}
            product={p}
            compact={compact}
            index={idx}
          />
        ))}
      </div>
    </div>
  );
}

function AffiliateProductCard({
  product,
  compact,
  index,
}: {
  product: AffiliateProduct;
  compact: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
    >
      <Card className="group flex h-full flex-col overflow-hidden p-0 transition-all hover:shadow-md hover:shadow-emerald-500/5 hover:-translate-y-0.5">
        <div
          className={cn(
            "relative overflow-hidden bg-muted/40",
            compact ? "aspect-[4/3]" : "aspect-square"
          )}
        >
          {product.image ? (
             
            <img
              src={product.image}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-contain p-1.5 transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <PackageOpen className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-2.5">
          <p
            className={cn(
              "font-bengali line-clamp-2 font-semibold text-foreground",
              compact ? "text-[11px]" : "text-xs"
            )}
            title={product.title}
          >
            {product.title}
          </p>
          {product.price && (
            <span className="font-bengali text-sm font-bold text-emerald-700 dark:text-emerald-400">
              ৳{product.price}
            </span>
          )}
          <Button
            asChild
            size="sm"
            className="mt-1 w-full gap-1 font-bengali cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <a
              href={product.url}
              target="_blank"
              rel="sponsored nofollow"
            >
              কিনুন
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
