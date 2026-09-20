import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import {
  affiliateUrlSchema,
  fetchAffiliatePreview,
} from "@/lib/affiliate-preview";

const MAX_PER_CATEGORY = 5;

/**
 * GET /api/affiliate?category=book|food
 *
 * Public: returns all affiliate products, optionally filtered by category.
 * Ordered by createdAt desc (newest first).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "";

  const where = category === "book" || category === "food" ? { category } : {};
  const products = await db.affiliateProduct.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      url: p.url,
      category: p.category,
      title: p.title,
      image: p.image,
      price: p.price,
      createdAt: p.createdAt,
    })),
  });
}

/**
 * POST /api/affiliate (admin only)
 *
 * Body: { url, category: "book" | "food" }
 *
 * - Validates the URL + category.
 * - Enforces MAX_PER_CATEGORY (5) per category — returns 400 if exceeded.
 * - Fetches og:title + og:image for display.
 * - Saves the product (price is null until admin edits — or we try to
 *   sniff a price meta tag).
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
  const parsed = affiliateUrlSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "অমান্য তথ্য।" },
      { status: 400 }
    );
  }
  const { url, category } = parsed.data;

  // Enforce max 5 per category.
  const count = await db.affiliateProduct.count({ where: { category } });
  if (count >= MAX_PER_CATEGORY) {
    return NextResponse.json(
      {
        error: `প্রতি ক্যাটাগরিতে সর্বোচ্চ ${MAX_PER_CATEGORY} টি প্রোডাক্ট রাখা যাবে।`,
      },
      { status: 400 }
    );
  }

  // Auto-fetch og:title + og:image.
  const preview = await fetchAffiliatePreview(url);
  const title = preview?.title || url; // fallback to URL if fetch failed
  const image = preview?.image || null;

  const product = await db.affiliateProduct.create({
    data: {
      url,
      category,
      title,
      image,
      price: null,
    },
  });

  return NextResponse.json({ ok: true, product });
}
