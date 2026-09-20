// Server-rendered blog card — আসল <a href> লিংক ব্যবহার করে (crawlable, SEO-friendly)।
// BlogCard (client) SPA-তে ব্যবহারের জন্য; এটা সার্ভার পেজের জন্য।
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowRight, Clock } from "lucide-react";
import { formatBengaliDate, formatBengaliNumber } from "@/lib/blog-utils";
import type { BlogListItem } from "@/lib/types";

export function ServerBlogCard({ blog }: { blog: BlogListItem }) {
  const href = `/blog/${encodeURIComponent(blog.slug)}`;
  return (
    <a
      href={href}
      className="group block h-full rounded-xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
    >
      {/* Feature image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-xl bg-muted">
        {blog.featureImage ? (
          <img
            src={blog.featureImage}
            alt={blog.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-emerald-500/10 to-teal-600/10">
            <svg
              viewBox="0 0 24 24"
              className="h-10 w-10 text-emerald-500/40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 21h18" />
              <path d="M5 21V11a7 7 0 0 1 14 0v10" />
              <path d="M12 3v3" />
              <circle cx="12" cy="14" r="1.5" fill="currentColor" />
            </svg>
          </div>
        )}
        {blog.category && (
          <Badge className="absolute left-3 top-3 border-emerald-500/30 bg-emerald-500/90 text-white hover:bg-emerald-500">
            {blog.category.name}
          </Badge>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bengali line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
          {blog.title}
        </h3>
        <p className="mt-1.5 font-bengali line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {blog.excerpt}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3 text-[11px]">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              {formatBengaliNumber(blog.views)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatBengaliDate(new Date(blog.createdAt))}
            </span>
          </div>
          <span className="flex items-center gap-1 font-bengali font-semibold text-emerald-600 dark:text-emerald-400">
            আরও পড়ুন
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </a>
  );
}
