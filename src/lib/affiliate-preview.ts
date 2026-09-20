// Affiliate product preview fetcher.
//
// Used by the admin affiliate manager: admin pastes ANY product URL
// (e.g. a rokomari book or food product), and we fetch the page to
// extract OpenGraph metadata (og:title, og:image) for display in the
// blog sidebar.
//
// The fetch uses a browser-like User-Agent header to avoid being blocked
// by simple bot-filters, and times out after 10 seconds.

import { z } from "zod";

export const affiliateUrlSchema = z.object({
  url: z
    .string()
    .url("একটি বৈধ URL দিন।")
    .min(1, "URL আবশ্যক।"),
  category: z.enum(["food", "book"], {
    message: "ক্যাটাগরি বই বা খাদ্য হতে হবে।",
  }),
});

export type AffiliateUrlInput = z.infer<typeof affiliateUrlSchema>;

export interface AffiliatePreview {
  title: string;
  image: string | null;
  url: string;
  price: string | null;
}

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Fetch a URL and extract og:title / og:image / twitter:title / twitter:image
 * from the HTML <head>. 10s timeout, browser User-Agent.
 *
 * Returns { title, image, url, price: null } — we don't try to scrape
 * the price (it varies wildly per site and is unreliable); the admin
 * can edit the price manually after the preview is loaded.
 */
export async function fetchAffiliatePreview(
  url: string
): Promise<AffiliatePreview | null> {
  const clean = (url || "").trim();
  if (!clean) return null;

  // Use AbortController with a 10s timeout (Node 18+ supports it).
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(clean, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,bn;q=0.8",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const html = await res.text();
    return parseOgMetadata(html, clean);
  } catch {
    // Network error / timeout / blocked — return null so caller can show a
    // friendly message and let the admin type the details manually.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Extract og:title / og:image / twitter:* / <title> from raw HTML.
 */
function parseOgMetadata(html: string, originalUrl: string): AffiliatePreview {
  const title =
    extractMeta(html, "og:title") ||
    extractMeta(html, "twitter:title") ||
    extractTitleTag(html) ||
    new URL(originalUrl).hostname;

  const image =
    extractMeta(html, "og:image") ||
    extractMeta(html, "og:image:secure_url") ||
    extractMeta(html, "twitter:image") ||
    null;

  // Normalize image — make absolute if relative.
  const absImage = image ? absoluteUrl(image, originalUrl) : null;

  return {
    title: decodeEntities(title).slice(0, 300),
    image: absImage ? decodeEntities(absImage) : null,
    url: originalUrl,
    price: null,
  };
}

function extractMeta(html: string, key: string): string | null {
  // Match: <meta property="og:title" content="...">
  // also: <meta name="twitter:title" content="...">
  // also handles single-quote variants.
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escapeRegex(key)}["'][^>]*?content=["']([^"']*)["']`,
    "i"
  );
  // Also accept content= appearing BEFORE property/name (some sites do this).
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*?(?:property|name)=["']${escapeRegex(
      key
    )}["']`,
    "i"
  );
  const m1 = html.match(re);
  if (m1 && m1[1]) return m1[1];
  const m2 = html.match(re2);
  if (m2 && m2[1]) return m2[1];
  return null;
}

function extractTitleTag(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m && m[1] ? m[1].trim() : null;
}

function absoluteUrl(src: string, base: string): string {
  try {
    return new URL(src, base).toString();
  } catch {
    return src;
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .trim();
}
