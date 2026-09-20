import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

/* GET /api/categories — list all categories with blog counts */
export async function GET() {
  const cats = await db.blogCategory.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { blogs: { where: { published: true } } } },
    },
  });
  return NextResponse.json({
    categories: cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: c._count.blogs,
    })),
  });
}

/* POST /api/categories — admin create */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "অনুমতি নেই।" }, { status: 401 });
  }
  const body = await req.json();
  const name = String(body?.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "নাম দিন।" }, { status: 400 });
  }
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0980-\u09ff\w-]/g, "");
  const cat = await db.blogCategory.upsert({
    where: { slug: slug || name },
    update: {},
    create: { name, slug: slug || name },
  });
  return NextResponse.json({ ok: true, category: cat });
}
