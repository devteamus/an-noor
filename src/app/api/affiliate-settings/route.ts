import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import {
  saveAffiliateSettingsAndRebuild,
  getAffiliateSettings,
} from "@/lib/shop-scraper";

const settingsSchema = z.object({
  affId: z.string().max(200),
  affs: z.string().max(200),
  cma: z.string().max(200),
});

/**
 * GET /api/affiliate-settings (public)
 *
 * Returns the global affiliate settings (affId, affs, cma). Visible to
 * everyone — these are appended to public shop product URLs anyway.
 */
export async function GET() {
  const settings = await getAffiliateSettings();
  return NextResponse.json({
    settings: settings
      ? settings
      : { affId: "", affs: "", cma: "" },
  });
}

/**
 * POST /api/affiliate-settings (admin only)
 *
 * Body: { affId, affs, cma }
 *
 * Saves the settings and rebuilds EVERY shop product's affiliateUrl with
 * the new params.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "অনুমতি নেই।" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "অমান্য JSON।" }, { status: 400 });
  }
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "অমান্য তথ্য।" },
      { status: 400 }
    );
  }

  await saveAffiliateSettingsAndRebuild(parsed.data);

  const productsCount = await db.shopProduct.count();
  return NextResponse.json({
    ok: true,
    settings: parsed.data,
    rebuilt: productsCount,
  });
}
