import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

// সাইটম্যাপে শুধু ক্লিন, canonical URL থাকে:
//   /  /blog  /blog/[slug]  /books  /contact  /privacy  /terms
// SPA ভিউ (?view=...) কখনোই সাইটম্যাপে থাকবে না — robots.txt সেগুলো disallow করে,
// তাই Search Console-এ "Submitted URL blocked by robots.txt" বা duplicate এরর আসবে না।
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

// প্রতি রিকোয়েস্টে তাজা তৈরি হয় — নতুন পোস্ট যোগ হলে পরের crawl-এই
// সাইটম্যাপে চলে আসে (নতুন deploy-এর দরকার হয় না)
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/books`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const blogs = await db.blog.findMany({
      where: {
        published: true,
        OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
      },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    const blogEntries: MetadataRoute.Sitemap = blogs.map((b) => ({
      url: `${BASE_URL}/blog/${encodeURIComponent(b.slug)}`,
      lastModified: b.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    return [...staticEntries, ...blogEntries];
  } catch {
    // DB unreachable at build time — স্ট্যাটিক রুটগুলো অন্তত থাকুক
    return staticEntries;
  }
}
