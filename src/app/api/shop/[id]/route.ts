import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import {
  buildAffiliateUrl,
  getAffiliateSettings,
  buildProductUrl,
} from "@/lib/shop-scraper";

const updateSchema = z.object({
  active: z.boolean().optional(),
  title: z.string().min(1).optional(),
  image: z.string().nullable().optional(),
  price: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * PUT /api/shop/[id] (admin only)
 *
 * Body (any subset):
 *   { active?, title?, image?, price?, sortOrder? }
 *
 * If the title is changed, we re-derive the product URL + affiliate URL.
 * If the affiliate settings change we don't touch here — that's handled
 * by /api/affiliate-settings which rebuilds every product's affiliateUrl.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "অনুমতি নেই।" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await db.shopProduct.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "প্রোডাক্ট পাওয়া যায়নি।" },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "অমান্য JSON।" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "অমান্য তথ্য।" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // If title is being changed, rebuild productUrl + affiliateUrl.
  let productUrl = existing.productUrl;
  let affiliateUrl = existing.affiliateUrl;
  if (data.title && data.title !== existing.title) {
    // If existing productUrl was generated from a rokomari id, rebuild it
    // with the new title (keeps slug in sync). If admin originally gave a
    // full URL we keep that URL untouched.
    if (!existing.productId.startsWith("http")) {
      productUrl = buildProductUrl(existing.productId, data.title);
    }
    const settings = await getAffiliateSettings();
    affiliateUrl = buildAffiliateUrl(productUrl, settings);
  }

  const updated = await db.shopProduct.update({
    where: { id },
    data: {
      ...(data.active !== undefined ? { active: data.active } : {}),
      ...(data.title ? { title: data.title } : {}),
      ...(data.image !== undefined ? { image: data.image?.trim() || null } : {}),
      ...(data.price !== undefined ? { price: data.price?.trim() || null } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      productUrl,
      affiliateUrl,
    },
  });

  return NextResponse.json({ ok: true, product: updated });
}

/**
 * DELETE /api/shop/[id] (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "অনুমতি নেই।" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await db.shopProduct.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "প্রোডাক্ট পাওয়া যায়নি।" },
      { status: 404 }
    );
  }
  await db.shopProduct.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
