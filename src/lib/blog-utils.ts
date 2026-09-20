// Blog helper utilities — re-exports interlinking + adds DB-bound helpers.
import { db } from "@/lib/db";
import {
  applySmartInterlinking,
  extractKeywords,
  type InterlinkTarget,
  slugify,
  stripHtml,
  generateMetaTitle,
  generateMetaDescription,
  generateExcerpt,
  readingMinutes,
} from "@/lib/interlinking";

export {
  applySmartInterlinking,
  extractKeywords,
  slugify,
  stripHtml,
  generateMetaTitle,
  generateMetaDescription,
  generateExcerpt,
  readingMinutes,
};
export type { InterlinkTarget };
export { MIN_INTERLINKS, MAX_INTERLINKS } from "@/lib/interlinking";

/* ---------- unique slug ---------- */
export async function uniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (true) {
    const existing = await db.blog.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${n}`;
    n++;
  }
  return slug;
}

/* ---------- category slug ---------- */
export function categorySlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\u0980-\u09ff\w-]/g, "") || name
  );
}

/* ---------- find-or-create category by name (CSV-friendly) ---------- */
export async function findOrCreateCategoryByName(name: string) {
  const clean = name.trim();
  if (!clean) return null;
  const slug = categorySlug(clean);
  return db.blogCategory.upsert({
    where: { slug },
    update: {},
    create: { name: clean, slug },
  });
}

/* ---------- record a view + daily log ----------
   keepUpdatedAt: ভিউ-কাউন্ট বাড়ানো sitemap-এর lastmod নাড়াবে না —
   নাহলে প্রতিটি ভিউতে updatedAt বদলে যায় আর Search Console-এ ফালতু আপডেট দেখায়। */
export async function recordView(
  blogId: string,
  keepUpdatedAt?: Date
): Promise<void> {
  const now = new Date();
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  await db.$transaction([
    db.blog.update({
      where: { id: blogId },
      data: {
        views: { increment: 1 },
        ...(keepUpdatedAt ? { updatedAt: keepUpdatedAt } : {}),
      },
    }),
    db.blogViewLog.upsert({
      where: { blogId_date: { blogId, date: dateKey } },
      update: { count: { increment: 1 } },
      create: { blogId, date: dateKey, count: 1 },
    }),
  ]);
}

/* ---------- is a blog currently visible? (scheduled logic) ---------- */
export function isBlogLive(b: { published: boolean; scheduledAt: Date | null }): boolean {
  if (!b.published) return false;
  if (!b.scheduledAt) return true;
  return b.scheduledAt.getTime() <= Date.now();
}

/* ---------- related content ---------- */
type BlogWithCategory = Awaited<
  ReturnType<typeof db.blog.findMany<{ include: { category: true } }>>
>[number];

export async function getRelatedPosts(
  blogId: string,
  categoryId: string | null,
  limit = 4
): Promise<BlogWithCategory[]> {
  const liveWhere = {
    published: true as const,
    OR: [
      { scheduledAt: null },
      { scheduledAt: { lte: new Date() } },
    ],
  };
  const related: BlogWithCategory[] = [];
  if (categoryId) {
    const same = await db.blog.findMany({
      where: { ...liveWhere, id: { not: blogId }, categoryId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { category: true },
    });
    related.push(...same);
  }
  if (related.length < limit) {
    const more = await db.blog.findMany({
      where: {
        ...liveWhere,
        id: {
          not: blogId,
          notIn: related.map((r) => r.id),
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit - related.length,
      include: { category: true },
    });
    related.push(...more);
  }
  return related.slice(0, limit);
}

/* ---------- build interlink targets for a given blog ---------- */
export async function buildInterlinkTargets(excludeBlogId: string): Promise<InterlinkTarget[]> {
  const others = await db.blog.findMany({
    where: {
      published: true,
      OR: [
        { scheduledAt: null },
        { scheduledAt: { lte: new Date() } },
      ],
      id: { not: excludeBlogId },
    },
    select: { id: true, title: true, slug: true, content: true },
    orderBy: { views: "desc" }, // prefer popular posts for interlinking
    take: 100,
  });
  return others.map((o) => ({
    title: o.title,
    slug: o.slug,
    keywords: extractKeywords(o.title, stripHtml(o.content)),
  }));
}

/* ---------- formatting ---------- */
export function formatBengaliDate(date: Date): string {
  const months = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
  ];
  const num = (n: number) => n.toLocaleString("bn-BD");
  return `${num(date.getDate())} ${months[date.getMonth()]}, ${num(date.getFullYear())}`;
}

export function formatBengaliNumber(n: number): string {
  return n.toLocaleString("bn-BD");
}

/* ---------- parse a schedule date from CSV (flexible) ---------- */
export function parseScheduleDate(input: string): Date | null {
  const s = input.trim();
  if (!s) return null;
  // Try ISO first
  const iso = new Date(s);
  if (!isNaN(iso.getTime())) return iso;
  // Try dd/mm/yyyy or dd-mm-yyyy
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\s*(\d{1,2}):(\d{2})?$/);
  if (m) {
    const [, d, mo, y, h = "9", min = "0"] = m;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(min));
    if (!isNaN(dt.getTime())) return dt;
  }
  const m2 = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m2) {
    const [, d, mo, y] = m2;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d), 9, 0);
    if (!isNaN(dt.getTime())) return dt;
  }
  return null;
}
