import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parse } from "csv-parse/sync";
import {
  uniqueSlug,
  generateMetaTitle,
  generateMetaDescription,
  generateExcerpt,
  findOrCreateCategoryByName,
  parseScheduleDate,
} from "@/lib/blog-utils";
import { formatBlogContent } from "@/lib/blog-content-formatter";

/* POST /api/blogs/bulk-csv  (admin only)
   Body: { csv: "<raw csv text>" }
   Columns (case-insensitive):
     title, content, feature image / featureImage / image, category, schedule / publishAt
   - metaTitle & metaDescription auto-generated from title + content.
   - category: if it matches an existing category (by name OR slug) it's reused,
     otherwise a new category is created from the CSV value.
   - schedule: optional ISO date / dd-mm-yyyy [HH:MM]; null/empty = publish immediately.
*/
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "অনুমতি নেই।" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const raw = String(body?.csv ?? "");
    if (!raw.trim()) {
      return NextResponse.json(
        { error: "CSV কনটেন্ট খালি।" },
        { status: 400 }
      );
    }

    const records = parse(raw, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });

    if (!records.length) {
      return NextResponse.json(
        { error: "CSV-এ কোনো ডেটা পাওয়া যায়নি।" },
        { status: 400 }
      );
    }

    const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
    const results: { created: number; scheduled: number; errors: string[] } = {
      created: 0,
      scheduled: 0,
      errors: [],
    };

    // cache categories by name AND slug to avoid repeated upserts
    const catCache = new Map<string, string>(); // key = lowercased name

    for (let i = 0; i < records.length; i++) {
      const row = records[i] as Record<string, string>;
      const lookup: Record<string, string> = {};
      for (const [k, v] of Object.entries(row)) {
        lookup[norm(k)] = v;
      }
      const title = (lookup.title || "").trim();
      const content = (lookup.content || "").trim();
      const featureImage =
        (lookup.featureimage || lookup.image || "").trim() || null;
      const categoryName = (lookup.category || "").trim();
      const scheduleStr =
        (lookup.schedule || lookup.publishat || lookup.publishdate || "").trim();

      if (!title || !content) {
        results.errors.push(`সারি ${i + 2}: শিরোনাম বা বিষয়বস্তু নেই — স্কিপ করা হলো।`);
        continue;
      }

      try {
        const slug = await uniqueSlug(title);

        // category: find-or-create by name (matches existing name OR slug)
        let categoryId: string | null = null;
        if (categoryName) {
          const key = categoryName.toLowerCase();
          if (catCache.has(key)) {
            categoryId = catCache.get(key)!;
          } else {
            const cat = await findOrCreateCategoryByName(categoryName);
            if (cat) {
              categoryId = cat.id;
              catCache.set(key, cat.id);
            }
          }
        }

        // schedule
        const scheduledAt = parseScheduleDate(scheduleStr);
        const willSchedule = !!scheduledAt;

        // content itself is stored as-provided (raw CSV text is formatted
        // at read time — see /api/blogs/[slug]/route.ts). Excerpt & meta
        // description are plain text though, so derive them from the
        // formatted HTML instead of the raw markdown-ish text — otherwise
        // they'd show literal "##" / "আরবি:" labels on the blog list cards.
        const excerptSource = formatBlogContent(content);

        await db.blog.create({
          data: {
            title,
            slug,
            content,
            excerpt: generateExcerpt(excerptSource),
            metaTitle: generateMetaTitle(title),
            metaDescription: generateMetaDescription(excerptSource),
            featureImage,
            published: true, // published=true; will go live when scheduledAt passes
            scheduledAt,
            categoryId,
          },
        });
        results.created++;
        if (willSchedule) results.scheduled++;
      } catch (e) {
        results.errors.push(
          `সারি ${i + 2}: "${title}" — ${e instanceof Error ? e.message : "ত্রুটি"}`
        );
      }
    }

    return NextResponse.json({
      ok: true,
      created: results.created,
      scheduled: results.scheduled,
      total: records.length,
      errors: results.errors,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          "CSV পার্সে সমস্যা — কলাম হেডার ঠিক আছে কিনা যাচাই করুন (title, content, feature image, category, schedule)।",
      },
      { status: 400 }
    );
  }
}
