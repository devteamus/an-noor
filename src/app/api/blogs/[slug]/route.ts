import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  uniqueSlug,
  generateMetaTitle,
  generateMetaDescription,
  generateExcerpt,
  applySmartInterlinking,
  buildInterlinkTargets,
  getRelatedPosts,
  readingMinutes,
  formatBengaliDate,
  recordView,
  isBlogLive,
  findOrCreateCategoryByName,
} from "@/lib/blog-utils";
import { formatBlogContent } from "@/lib/blog-content-formatter";

/* GET /api/blogs/[slug] — single post, increments views, returns interlinked content + related */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const blog = await db.blog.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!blog) {
    return NextResponse.json({ error: "ব্লগ পাওয়া যায়নি।" }, { status: 404 });
  }

  // visibility: live blogs are public; scheduled/draft only to admin
  const live = isBlogLive(blog);
  if (!live) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "এই ব্লগটি এখনও প্রকাশিত হয়নি।" },
        { status: 404 }
      );
    }
  }

  // record view only for live blogs (so admin previews don't inflate)
  if (live) {
    await recordView(blog.id, blog.updatedAt);
  }

  // build interlink targets and apply smart interlinking
  const targets = await buildInterlinkTargets(blog.id);
  const { html: interlinkedContent, linksAdded, linkedSlugs } =
    applySmartInterlinking(blog.content, targets);

  // CSV-imported posts store plain markdown-ish text (## headings, FAQ,
  // "আরবি: / বাংলা উচ্চারণ: / বাংলা অর্থ:" dua blocks, quoted ayat/hadith
  // citations) rather than real HTML — format it into structured, styled
  // markup here. Hand-authored HTML (single-publish form) passes through
  // untouched; interlink anchors & the auto "আরও পড়ুন" block are preserved.
  const formattedContent = formatBlogContent(interlinkedContent);

  // related posts
  const related = await getRelatedPosts(blog.id, blog.categoryId, 4);

  return NextResponse.json({
    blog: {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      content: formattedContent,
      excerpt: blog.excerpt,
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
      featureImage: blog.featureImage,
      views: blog.views + (live ? 1 : 0),
      createdAt: blog.createdAt,
      scheduledAt: blog.scheduledAt,
      readingMinutes: readingMinutes(blog.content),
      category: blog.category
        ? { name: blog.category.name, slug: blog.category.slug }
        : null,
    },
    related: related.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      featureImage: r.featureImage,
      views: r.views,
      createdAt: r.createdAt,
      category: r.category
        ? { name: r.category.name, slug: r.category.slug }
        : null,
    })),
    formattedDate: formatBengaliDate(blog.createdAt),
    interlinkStats: {
      count: linksAdded,
      slugs: linkedSlugs,
      minRequired: 8,
    },
  });
}

/* PUT /api/blogs/[slug] — admin update */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "অনুমতি নেই।" }, { status: 401 });
  }
  const { slug } = await params;
  const blog = await db.blog.findUnique({ where: { slug } });
  if (!blog) {
    return NextResponse.json({ error: "ব্লগ পাওয়া যায়নি।" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const title = body?.title ? String(body.title).trim() : blog.title;
    const content = body?.content ? String(body.content).trim() : blog.content;
    const featureImage =
      body?.featureImage !== undefined
        ? String(body.featureImage).trim() || null
        : blog.featureImage;
    const published =
      body?.published !== undefined ? body?.published !== false : blog.published;

    let scheduledAt = blog.scheduledAt;
    if (body?.scheduledAt !== undefined) {
      if (body.scheduledAt === null || body.scheduledAt === "") {
        scheduledAt = null;
      } else {
        const d = new Date(body.scheduledAt);
        scheduledAt = isNaN(d.getTime()) ? null : d;
      }
    }

    const newSlug =
      title !== blog.title ? await uniqueSlug(title, blog.id) : blog.slug;

    let categoryId = blog.categoryId;
    if (body?.category !== undefined) {
      const catName = String(body.category).trim();
      if (catName) {
        const cat = await findOrCreateCategoryByName(catName);
        categoryId = cat?.id ?? null;
      } else {
        categoryId = null;
      }
    }

    const updated = await db.blog.update({
      where: { id: blog.id },
      data: {
        title,
        slug: newSlug,
        content,
        excerpt: generateExcerpt(formatBlogContent(content)),
        metaTitle: generateMetaTitle(title),
        metaDescription: generateMetaDescription(formatBlogContent(content)),
        featureImage,
        published,
        scheduledAt,
        categoryId,
      },
      include: { category: true },
    });

    return NextResponse.json({ ok: true, blog: updated });
  } catch (e) {
    return NextResponse.json(
      { error: "আপডেটে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

/* DELETE /api/blogs/[slug] — admin delete */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "অনুমতি নেই।" }, { status: 401 });
  }
  const { slug } = await params;
  const blog = await db.blog.findUnique({ where: { slug } });
  if (!blog) {
    return NextResponse.json({ error: "ব্লগ পাওয়া যায়নি।" }, { status: 404 });
  }
  await db.blog.delete({ where: { id: blog.id } });
  return NextResponse.json({ ok: true });
}
