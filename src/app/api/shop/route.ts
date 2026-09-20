import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import {
  buildAffiliateUrl,
  getAffiliateSettings,
  buildProductUrl,
} from "@/lib/shop-scraper";

const PER_PAGE = 20;

const createSchema = z.object({
  productId: z.string().min(1, "Product ID আবশ্যক।"),
  title: z.string().min(1, "শিরোনাম আবশ্যক।"),
  image: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
});

/**
 * GET /api/shop?page=1&all=true
 *
 * - Public: returns only active products, sorted by sortOrder asc.
 * - Admin (via ?all=true): returns all products (active + inactive).
 * - 20 per page.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const wantAll = searchParams.get("all") === "true";

  let canSeeInactive = false;
  if (wantAll) {
    const session = await getSession();
    canSeeInactive = !!session;
  }

  const where = canSeeInactive ? {} : { active: true };
  const [total, products] = await Promise.all([
    db.shopProduct.count({ where }),
    db.shopProduct.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      productId: p.productId,
      title: p.title,
      image: p.image,
      price: p.price,
      productUrl: p.productUrl,
      affiliateUrl: p.affiliateUrl,
      active: p.active,
      sortOrder: p.sortOrder,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    page,
    totalPages,
    total,
    perPage: PER_PAGE,
  });
}

/**
 * POST /api/shop (admin only)
 *
 * Body: { productId, title, image?, price? }
 *
 * Builds the affiliate URL from the global AffiliateSetting row and
 * assigns the next available sortOrder (max+1).
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

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "অমান্য তথ্য।" },
      { status: 400 }
    );
  }
  const { productId, title, image, price } = parsed.data;

  // Determine product URL.
  // The admin only types the rokomari product id (and title). We build
  // the canonical rokomari URL from them. If the admin passes a full
  // URL in `productId` (starts with http) we keep it as-is.
  const rawId = productId.trim();
  const productUrl = rawId.startsWith("http")
    ? rawId
    : buildProductUrl(rawId, title);

  const settings = await getAffiliateSettings();
  const affiliateUrl = buildAffiliateUrl(productUrl, settings);

  // Auto sortOrder — append at end.
  const max = await db.shopProduct.aggregate({
    _max: { sortOrder: true },
  });
  const nextSort = (max._max.sortOrder ?? 0) + 1;

  const product = await db.shopProduct.create({
    data: {
      productId: rawId,
      title: title.trim(),
      image: image?.trim() || null,
      price: price?.trim() || null,
      productUrl,
      affiliateUrl,
      active: true,
      sortOrder: nextSort,
    },
  });

  return NextResponse.json({ ok: true, product });
}
