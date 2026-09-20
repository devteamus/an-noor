"use client";

import * as React from "react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  BookOpen,
  ShoppingBag,
  Flame,
  HeartHandshake,
} from "lucide-react";
import { motion } from "framer-motion";

interface ShopBook {
  id: string;
  title: string;
  image: string | null;
  price: string | null;
  productUrl: string;
  affiliateUrl: string;
}

/**
 * BestSellingBooks — ব্লগ পোস্টে "সম্পর্কিত আর্টিকেল"-এর উপরে বসে।
 * শপ পেজের ইসলামিক বই থেকে ৪টি ছোট কার্ডে গ্রিড ভিউতে দেখায়।
 * "কিনুন" বাটনে অ্যাফিলিয়েট লিংক খোলে।
 * প্রোডাক্ট না থাকলে পুরো অংশটি লুকিয়ে থাকে।
 */
export function BestSellingBooks({ max = 4 }: { max?: number }) {
  const goShop = useAppStore((s) => s.goShop);
  const [books, setBooks] = React.useState<ShopBook[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    fetch("/api/shop?page=1")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setBooks((d.products || []).slice(0, max));
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [max]);

  if (loading || books.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      aria-label="Best Selling Islamic Books"
      className="overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.07] via-orange-500/[0.04] to-emerald-500/[0.05] p-4 sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <Flame className="h-3.5 w-3.5" />
          </span>
          <h2 className="truncate text-sm font-bold tracking-wide text-foreground">
            Best Selling Islamic Books
          </h2>
          <Badge
            variant="secondary"
            className="ml-1 hidden shrink-0 gap-1 border-amber-500/30 bg-amber-500/10 px-1.5 py-0 text-[10px] text-amber-700 dark:text-amber-300 sm:inline-flex"
          >
            <Flame className="h-3 w-3" />
            HOT
          </Badge>
        </div>
        <button
          onClick={() => goShop()}
          className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-bengali text-[10px] font-bold text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
        >
          <ShoppingBag className="h-3 w-3" />
          সব বই
        </button>
      </div>

      {/* ছোট কার্ডে ৪টি বই — মোবাইলে ২টি, ডেস্কটপে ৪টি এক সারিতে */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {books.map((b, idx) => (
          <BestBookCard key={b.id} book={b} index={idx} />
        ))}
      </div>

      <div className="mt-3 space-y-1 text-center">
        <p className="flex items-center justify-center gap-1.5 font-bengali text-[11px] font-semibold text-amber-700 dark:text-amber-300">
          <HeartHandshake className="h-3.5 w-3.5 shrink-0" />
          আমাদের ভালো কাজকে সাপোর্ট করতে বইটি কিনুন
        </p>
        <p className="font-bengali text-[10px] italic leading-relaxed text-muted-foreground">
          «যে জ্ঞানের পথে চলে, আল্লাহ তার জন্য জান্নাতের পথ সহজ করে দেন» —
          সহিহ মুসলিম
        </p>
      </div>
    </motion.section>
  );
}

function BestBookCard({ book, index }: { book: ShopBook; index: number }) {
  const price = book.price ? book.price.replace(/\s*Taka/i, "").trim() : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.2) }}
    >
      <Card className="group flex h-full flex-col overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-amber-500/10">
        {/* ছোট কভার — aspect-[3/4] */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/40">
          {book.image ? (
            <img
              src={book.image}
              alt={book.title}
              loading="lazy"
              className="h-full w-full object-contain p-1.5 transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* তথ্য + বাটন */}
        <div className="flex min-w-0 flex-1 flex-col gap-1 p-2">
          <p
            className="font-bengali line-clamp-2 text-[11px] font-semibold leading-snug text-foreground"
            title={book.title}
          >
            {book.title}
          </p>
          {price && (
            <span className="font-bengali text-xs font-bold text-emerald-700 dark:text-emerald-400">
              ৳{price}
            </span>
          )}
          <Button
            asChild
            size="sm"
            className="mt-auto w-full gap-1 font-bengali text-[11px] cursor-pointer bg-amber-600 text-white hover:bg-amber-700"
          >
            <a
              href={book.affiliateUrl || book.productUrl}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
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
