import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Docker / Coolify healthcheck endpoint — অ্যাপ + ডেটাবেস দুটোই বেঁচে আছে
// কি না এক কলেই যাচাই। 200 = সব ঠিক, 503 = DB সমস্যা।
export const dynamic = "force-dynamic";

export async function GET() {
  let dbOk = false;
  try {
    await db.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }
  return NextResponse.json(
    {
      ok: dbOk,
      db: dbOk,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    { status: dbOk ? 200 : 503 }
  );
}
