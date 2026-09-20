import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

/* GET /api/admin/analytics — admin-only dashboard overview
   Returns: totalPosts, publishedPosts, scheduledPosts, draftPosts,
            totalViews, views7d, views15d, views30d,
            daily series for last 30 days, top posts, category breakdown.
*/
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "অনুমতি নেই।" }, { status: 401 });
  }

  const now = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const d7 = daysAgo(7);
  const d15 = daysAgo(15);
  const d30 = daysAgo(30);

  // totals
  const [totalPosts, publishedPosts, scheduledPosts, draftPosts] =
    await Promise.all([
      db.blog.count(),
      db.blog.count({
        where: {
          published: true,
          OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
        },
      }),
      db.blog.count({
        where: { published: true, scheduledAt: { gt: now } },
      }),
      db.blog.count({ where: { published: false } }),
    ]);
  void draftPosts; // available for UI if needed

  // total views
  const totalViewsAgg = await db.blog.aggregate({ _sum: { views: true } });
  const totalViews = totalViewsAgg._sum.views ?? 0;

  // daily view logs for last 30 days
  const dateKeys: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = daysAgo(i);
    dateKeys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }

  const logs = await db.blogViewLog.findMany({
    where: { date: { in: dateKeys } },
    select: { date: true, count: true },
  });

  const byDate = new Map<string, number>();
  for (const l of logs) {
    byDate.set(l.date, (byDate.get(l.date) ?? 0) + l.count);
  }

  const dailySeries = dateKeys.map((k) => ({
    date: k,
    views: byDate.get(k) ?? 0,
  }));

  const sumLast = (n: number) =>
    dailySeries.slice(30 - n).reduce((a, b) => a + b.views, 0);

  const views7d = sumLast(7);
  const views15d = sumLast(15);
  const views30d = sumLast(30);

  // top posts by views (top 5)
  const topPosts = await db.blog.findMany({
    orderBy: { views: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      views: true,
      published: true,
      scheduledAt: true,
    },
  });

  // category breakdown
  const categories = await db.blogCategory.findMany({
    include: {
      _count: { select: { blogs: true } },
      blogs: { select: { views: true } },
    },
  });
  const categoryStats = categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      posts: c._count.blogs,
      views: c.blogs.reduce((a, b) => a + b.views, 0),
    }))
    .sort((a, b) => b.views - a.views);

  return NextResponse.json({
    totals: {
      posts: totalPosts,
      published: publishedPosts,
      scheduled: scheduledPosts,
      drafts: draftPosts,
      views: totalViews,
    },
    viewsRange: {
      last7d: views7d,
      last15d: views15d,
      last30d: views30d,
    },
    dailySeries, // 30 entries
    topPosts,
    categories: categoryStats,
  });
}
