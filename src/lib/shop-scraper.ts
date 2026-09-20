// Shop affiliate URL builder.
//
// NOTE: We no longer scrape rokomari product pages directly — Cloudflare
// actively blocks server-side requests (returns 403 / challenge pages).
// Instead the admin enters product details (id / title / image / price)
// manually and we only build the affiliate URL from the global settings.

import { db } from "@/lib/db";

export interface AffiliateSettings {
  affId: string;
  affs: string;
  cma: string;
}

/**
 * Build a Rokomari-style affiliate URL by appending the global affiliate
 * parameters (affId, affs, cma) to a normal product URL.
 *
 *   buildAffiliateUrl(
 *     "https://www.rokomari.com/product/168407/casio-scientific-calculator-2nd-edition",
 *     { affId: "oIOmRo7k86or1AK", affs: "72292", cma: "604800" }
 *   )
 *   → "https://www.rokomari.com/product/168407/casio-scientific-calculator-2nd-edition?affId=oIOmRo7k86or1AK&affs=72292&cma=604800"
 *
 * If any setting is empty, that parameter is skipped. If the original URL
 * already has a query string, the affiliate params are appended with `&`.
 */
export function buildAffiliateUrl(
  productUrl: string,
  settings: AffiliateSettings | null | undefined
): string {
  if (!productUrl) return "";
  const base = productUrl.trim();
  if (!settings) return base;

  const params = new URLSearchParams();
  if (settings.affId) params.set("affId", settings.affId);
  if (settings.affs) params.set("affs", settings.affs);
  if (settings.cma) params.set("cma", settings.cma);

  const qs = params.toString();
  if (!qs) return base;

  // Preserve any existing query/hash — append our params with `&` if needed.
  const hashIdx = base.indexOf("#");
  let urlPart = base;
  let hashPart = "";
  if (hashIdx >= 0) {
    urlPart = base.slice(0, hashIdx);
    hashPart = base.slice(hashIdx);
  }
  const sep = urlPart.includes("?") ? "&" : "?";
  return `${urlPart}${sep}${qs}${hashPart}`;
}

/**
 * Build a product URL from a Rokomari product id + slug title.
 *
 *   buildProductUrl("168407", "Casio Scientific Calculator 2nd Edition")
 *   → "https://www.rokomari.com/product/168407/casio-scientific-calculator-2nd-edition"
 *
 * If the slug is missing the URL still works (Rokomari redirects on id alone):
 *   → "https://www.rokomari.com/product/168407/"
 */
export function buildProductUrl(productId: string, title?: string): string {
  const id = (productId || "").trim();
  if (!id) return "";
  const slug = slugifyTitle(title || "");
  if (slug) {
    return `https://www.rokomari.com/product/${id}/${slug}`;
  }
  return `https://www.rokomari.com/product/${id}/`;
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Load the global AffiliateSetting row (singleton — first row).
 * Returns null if none exists yet.
 */
export async function getAffiliateSettings(): Promise<AffiliateSettings | null> {
  const row = await db.affiliateSetting.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (!row) return null;
  return { affId: row.affId, affs: row.affs, cma: row.cma };
}

/**
 * Persist the global affiliate settings (upsert to first row), then
 * rebuild every ShopProduct.affiliateUrl with the new params.
 */
export async function saveAffiliateSettingsAndRebuild(
  settings: AffiliateSettings
): Promise<void> {
  const existing = await db.affiliateSetting.findFirst();
  if (existing) {
    await db.affiliateSetting.update({
      where: { id: existing.id },
      data: {
        affId: settings.affId,
        affs: settings.affs,
        cma: settings.cma,
      },
    });
  } else {
    await db.affiliateSetting.create({
      data: {
        affId: settings.affId,
        affs: settings.affs,
        cma: settings.cma,
      },
    });
  }

  // Rebuild every shop product's affiliate URL using the new settings.
  const products = await db.shopProduct.findMany();
  await Promise.all(
    products.map((p) =>
      db.shopProduct.update({
        where: { id: p.id },
        data: { affiliateUrl: buildAffiliateUrl(p.productUrl, settings) },
      })
    )
  );
}
