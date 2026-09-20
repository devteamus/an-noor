import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  uniqueSlug,
  generateMetaTitle,
  generateMetaDescription,
  generateExcerpt,
  findOrCreateCategoryByName,
  isBlogLive,
  parseScheduleDate,
} from "@/lib/blog-utils";
import { formatBlogContent } from "@/lib/blog-content-formatter";

const PER_PAGE = 20;

/* GET /api/blogs?page=1&category=slug&q=text&all=true (all=admin) */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const categorySlug = searchParams.get("category") || "";
  const q = (searchParams.get("q") || "").trim();
  const wantAll = searchParams.get("all") === "true";

  // only admins can see unpublished / scheduled-future
  let canSeeUnpublished = false;
  if (wantAll) {
    const session = await getSession();
    canSeeUnpublished = !!session;
  }

  const where: Record<string, unknown> = canSeeUnpublished
    ? {}
    : {
        published: true,
        OR: [
          { scheduledAt: null },
          { scheduledAt: { lte: new Date() } },
        ],
      };
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { content: { contains: q } },
    ];
  }

  const [total, blogs] = await Promise.all([
    db.blog.count({ where }),
    db.blog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { category: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return NextResponse.json({
    blogs: blogs.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      featureImage: b.featureImage,
      views: b.views,
      published: b.published,
      scheduledAt: b.scheduledAt,
      live: isBlogLive(b),
      createdAt: b.createdAt,
      category: b.category
        ? { name: b.category.name, slug: b.category.slug }
        : null,
    })),
    page,
    totalPages,
    total,
    perPage: PER_PAGE,
  });
}

/* POST /api/blogs  (admin only) — create a single blog */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "অনুমতি নেই।" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const content = String(body?.content ?? "").trim();
    const featureImage = String(body?.featureImage ?? "").trim() || null;
    const categoryName = String(body?.category ?? "").trim();
    const published = body?.published !== false;

    // schedule: ISO string or null
    let scheduledAt: Date | null = null;
    if (body?.scheduledAt) {
      const d = new Date(body.scheduledAt);
      if (!isNaN(d.getTime())) scheduledAt = d;
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: "শিরোনাম ও বিষয়বস্তু আবশ্যক।" },
        { status: 400 }
      );
    }

    const slug = await uniqueSlug(title);

    let categoryId: string | null = null;
    if (categoryName) {
      const cat = await findOrCreateCategoryByName(categoryName);
      categoryId = cat?.id ?? null;
    }

    const metaTitle = generateMetaTitle(title);
    const excerptSource = formatBlogContent(content);
    const metaDescription = generateMetaDescription(excerptSource);
    const excerpt = generateExcerpt(excerptSource);

    const blog = await db.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        metaTitle,
        metaDescription,
        featureImage,
        published,
        scheduledAt,
        categoryId,
      },
      include: { category: true },
    });

    return NextResponse.json({ ok: true, blog });
  } catch (e) {
    return NextResponse.json(
      { error: "ব্লগ তৈরিতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

// re-export parseScheduleDate for use in bulk route via import if needed
export { parseScheduleDate };
