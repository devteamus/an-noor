"use client";

import * as React from "react";
import { useAppStore } from "@/lib/store";
import { BlogCard } from "@/components/app/blog-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  Eye,
  Clock,
  Calendar,
  BookOpen,
  Sparkles,
  Share2,
  ArrowLeft,
} from "lucide-react";
import type { BlogPostResponse, BlogListItem } from "@/lib/types";
import { formatBengaliNumber } from "@/lib/blog-utils";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { BestSellingBooks } from "@/components/app/best-selling-books";



export function BlogPostView({ slug }: { slug: string }) {
  const goBlog = useAppStore((s) => s.goBlog);
  const goBlogPost = useAppStore((s) => s.goBlogPost);
  const { toast } = useToast();

  const [data, setData] = React.useState<BlogPostResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetch(`/api/blogs/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => {
        if (!active) return;
        if (d.error) setError(d.error);
        else {
          setData(d);
          // update document title for SEO/shareability
          if (typeof document !== "undefined" && d.blog) {
            document.title = d.blog.metaTitle || d.blog.title;
          }
        }
      })
      .catch(() => active && setError("ব্লগ পাওয়া যায়নি।"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  const handleShare = async () => {
    if (!data) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: data.blog.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "লিংক কপি হয়েছে",
          description: "শেয়ার করতে পারেন।",
        });
      }
    } catch {
      /* user cancelled */
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2 pt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="grid place-items-center p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-3 font-bengali text-sm text-foreground">{error}</p>
          <Button onClick={() => goBlog()} className="mt-4 font-bengali">
            ব্লগে ফিরুন
          </Button>
        </Card>
      </div>
    );
  }

  const { blog, related, formattedDate } = data;

  return (
    <div className="mx-auto max-w-6xl">
      {/* ফুল-ওয়াইড একক কলাম — সাইডবার নেই */}
      <div className="min-w-0 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs font-bengali text-muted-foreground">
        <button onClick={() => goBlog()} className="cursor-pointer hover:text-foreground">
          ব্লগ
        </button>
        <ChevronRight className="h-3 w-3" />
        {blog.category && (
          <>
            <span className="text-foreground/70">{blog.category.name}</span>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="min-w-0 flex-1 truncate text-foreground">{blog.title}</span>
      </nav>

      {/* Article header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {blog.category && (
          <Badge className="mb-3 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15">
            {blog.category.name}
          </Badge>
        )}
        <h1 className="font-bengali text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl">
          {blog.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 font-bengali text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatBengaliNumber(blog.readingMinutes)} মিনিট পড়ার মতো
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {formatBengaliNumber(blog.views)} বার দেখা হয়েছে
          </span>
        </div>
      </motion.div>

      {/* Feature image */}
      {blog.featureImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-hidden rounded-2xl border border-border/60"
        >
          <img
            src={blog.featureImage}
            alt={blog.title}
            className="aspect-[16/9] w-full object-cover"
          />
        </motion.div>
      )}

      {/* Content — পুরো লেখা এক টানা, মাঝে কোনো বইয়ের গ্রিড নেই */}
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Share */}
      <div className="flex items-center justify-between border-y border-border/60 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goBlog()}
          className="gap-1.5 font-bengali cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          ব্লগে ফিরুন
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-1.5 font-bengali cursor-pointer"
        >
          <Share2 className="h-4 w-4" />
          শেয়ার করুন
        </Button>
      </div>

      {/* Best Selling Islamic Books — সম্পর্কিত আর্টিকেলের উপরে */}
      <BestSellingBooks max={4} />

      {/* Related content */}
      {related.length > 0 && (
        <section className="pt-2">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="font-bengali text-lg font-bold text-foreground">
              সম্পর্কিত আর্টিকেল
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {related.map((r: BlogListItem, idx) => (
              <BlogCard
                key={r.id}
                blog={r}
                index={idx}
                onOpen={goBlogPost}
              />
            ))}
          </div>
        </section>
      )}
      </div>
    </div>
  );
}
