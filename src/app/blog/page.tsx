import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/app/header";
import { AppFooter } from "@/components/app/footer";
import { ServerBlogCard } from "@/components/app/server-blog-card";
import { formatBengaliNumber } from "@/lib/blog-utils";
import { BookOpen, Newspaper } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";
const PER_PAGE = 9;

// প্রতিবার রিকোয়েস্টে রেন্ডার — নতুন পোস্ট/কাউন্ট সাথে সাথে দেখায়,
// আর Vercel build-এ DB ছাড়াও বিল্ড পাস করে (DB unreachable হলেও ভাঙে না)
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ page?: string; category?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { category } = await searchParams;
  const url = category
    ? `${BASE_URL}/blog?category=${encodeURIComponent(category)}`
    : `${BASE_URL}/blog`;
  const title = category
    ? `${category === "all" ? "সব" : category} ক্যাটাগরির ইসলামিক ব্লগ`
    : "ইসলামিক ব্লগ — দোয়া, আমল ও জীবনযাপন";
  return {
    title,
    description:
      "আন-নূর ইসলামিক ব্লগ — সহিহ দোয়া, যিকির, রুকইয়াহ, নামাজ, রিজিক ও দৈনন্দিন জীবনের আমল নিয়ে কুরআন ও সুন্নাহভিত্তিক আর্টিকেল।",
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "bn_BD",
      url,
      siteName: "আন-নূর",
      title,
      description: "সহিহ দোয়া ও আমল নিয়ে কুরআন-সুন্নাহভিত্তিক ইসলামিক আর্টিকেল।",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "আন-নূর ইসলামিক ব্লগ" }],
    },
    twitter: { card: "summary_large_image", title, images: ["/og-image.png"] },
  };
}

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page: pageParam, category } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const liveWhere = {
    published: true as const,
    OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
  };

  const [categories, total, blogs] = await Promise.all([
    db.blogCategory.findMany({
      where: { blogs: { some: liveWhere } },
      select: { name: true, slug: true, _count: { select: { blogs: true } } },
      orderBy: { name: "asc" },
    }),
    db.blog.count({
      where: { ...liveWhere, ...(category ? { category: { slug: category } } : {}) },
    }),
    db.blog.findMany({
      where: { ...liveWhere, ...(category ? { category: { slug: category } } : {}) },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const activeCat = category || "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "আন-নূর ইসলামিক ব্লগ",
    url: `${BASE_URL}/blog`,
    inLanguage: "bn",
    description: "সহিহ দোয়া ও আমল নিয়ে কুরআন-সুন্নাহভিত্তিক ইসলামিক আর্টিকেল।",
    publisher: { "@type": "Organization", name: "আন-নূর", url: BASE_URL },
    blogPost: blogs.map((b) => ({
      "@type": "BlogPosting",
      headline: b.title,
      url: `${BASE_URL}/blog/${encodeURIComponent(b.slug)}`,
      datePublished: b.createdAt.toISOString(),
      dateModified: b.updatedAt.toISOString(),
    })),
  };

  return (
    <div className="flex min-h-screen flex-col pattern-bg">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-7">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-bengali text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                হোম
              </Link>
              <span aria-hidden="true">›</span>
              <span className="text-foreground">ব্লগ</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-600/15">
                <Newspaper className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              </div>
              <div>
                <h1 className="font-bengali text-2xl font-bold text-foreground sm:text-3xl">
                  ইসলামিক ব্লগ
                </h1>
                <p className="mt-0.5 font-bengali text-xs text-muted-foreground">
                  মোট {formatBengaliNumber(total)} টি আর্টিকেল
                </p>
              </div>
            </div>
          </div>

          {/* Category chips — আসল লিংক (indexable) */}
          <div className="mb-6 flex flex-wrap gap-2">
            <Link
              href="/blog"
              className={`inline-flex h-8 items-center rounded-full border px-3.5 font-bengali text-xs transition-colors ${
                activeCat === ""
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-border/60 bg-card text-muted-foreground hover:border-emerald-500/40 hover:text-foreground"
              }`}
            >
              সব
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/blog?category=${encodeURIComponent(c.slug)}`}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 font-bengali text-xs transition-colors ${
                  activeCat === c.slug
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-border/60 bg-card text-muted-foreground hover:border-emerald-500/40 hover:text-foreground"
                }`}
              >
                {c.name}
                <span className="opacity-70">{formatBengaliNumber(c._count.blogs)}</span>
              </Link>
            ))}
          </div>

          {/* Posts grid */}
          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((b) => (
                <ServerBlogCard
                  key={b.id}
                  blog={{
                    id: b.id,
                    title: b.title,
                    slug: b.slug,
                    excerpt: b.excerpt || "",
                    featureImage: b.featureImage || null,
                    views: b.views,
                    createdAt: b.createdAt.toISOString(),
                    category: b.category
                      ? { name: b.category.name, slug: b.category.slug }
                      : null,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="grid place-items-center rounded-xl border border-border/60 bg-card p-12 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
              <p className="mt-3 font-bengali text-sm text-muted-foreground">
                এই ক্যাটাগরিতে এখনও কোনো আর্টিকেল নেই।
              </p>
            </div>
          )}

          {/* Pagination — আসল লিংক */}
          {totalPages > 1 && (
            <nav
              className="mt-8 flex items-center justify-center gap-2"
              aria-label="পেজিনেশন"
            >
              {page > 1 && (
                <Link
                  href={`/blog${activeCat ? `?category=${encodeURIComponent(activeCat)}` : ""}${page > 2 ? `${activeCat ? "&" : "?"}page=${page - 1}` : ""}`}
                  className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 font-bengali text-xs shadow-sm hover:bg-accent"
                >
                  আগের পেজ
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/blog${activeCat ? `?category=${encodeURIComponent(activeCat)}&` : "?"}page=${p}`}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-md border font-bengali text-xs shadow-sm ${
                    p === page
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-input bg-background hover:bg-accent"
                  }`}
                >
                  {formatBengaliNumber(p)}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={`/blog${activeCat ? `?category=${encodeURIComponent(activeCat)}&` : "?"}page=${page + 1}`}
                  className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 font-bengali text-xs shadow-sm hover:bg-accent"
                >
                  পরের পেজ
                </Link>
              )}
            </nav>
          )}
        </div>
      </main>
      <AppFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
