import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/app/header";
import { AppFooter } from "@/components/app/footer";
import { HeartHandshake, BookOpen } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

// অ্যাডমিন প্যানেল থেকে বই যোগ/সরালে সাথে সাথে দেখায় + বিল্ড-টাইমে DB লাগে না
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "বেস্ট সেলিং ইসলামিক বই — রকমারি",
  description:
    "আন-নূর সিলেকশনের বেস্ট সেলিং ইসলামিক বই — দোয়া, সীরাত, হাদিস ও মুসলিম জীবনযাপনের জন্য নির্ভরযোগ্য বই। নিরাপদ রকমারি ডেলিভারি।",
  alternates: { canonical: `${BASE_URL}/books` },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: `${BASE_URL}/books`,
    siteName: "আন-নূর",
    title: "বেস্ট সেলিং ইসলামিক বই — আন-নূর সিলেকশন",
    description: "দোয়া, সীরাত, হাদিস ও মুসলিম জীবনযাপনের নির্ভরযোগ্য বই।",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "আন-নূর — ইসলামিক বই" }],
  },
  twitter: { card: "summary_large_image", images: ["/og-image.png"] },
};

function parsePriceTaka(price: string | null): number | null {
  if (!price) return null;
  const m = price.replace(/[৳,]/g, "").match(/\d+/);
  return m ? Number(m[0]) : null;
}

export default async function BooksPage() {
  const products = await db.shopProduct.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "বেস্ট সেলিং ইসলামিক বই",
    url: `${BASE_URL}/books`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => {
      const price = parsePriceTaka(p.price);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.title,
          url: p.productUrl,
          ...(p.image ? { image: [p.image] } : {}),
          ...(price
            ? {
                offers: {
                  "@type": "Offer",
                  price,
                  priceCurrency: "BDT",
                  availability: "https://schema.org/InStock",
                  url: p.productUrl,
                },
              }
            : {}),
        },
      };
    }),
  };

  return (
    <div className="flex min-h-screen flex-col pattern-bg">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-7">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-bengali text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                হোম
              </Link>
              <span aria-hidden="true">›</span>
              <span className="text-foreground">ইসলামিক বই</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-600/15">
                <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              </div>
              <div>
                <h1 className="font-bengali text-2xl font-bold text-foreground sm:text-3xl">
                  বেস্ট সেলিং ইসলামিক বই
                </h1>
                <p className="mt-0.5 font-bengali text-xs text-muted-foreground">
                  আন-নূর সিলেকশন · নিরাপদ রকমারি ডেলিভারি
                </p>
              </div>
            </div>
          </div>

          {/* Book grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => {
                const taka = p.price ? p.price.replace(/\s*Taka\s*/i, "").trim() : "";
                return (
                  <div
                    key={p.id}
                    className="flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card p-2.5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.title}
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <h2 className="mt-2 line-clamp-2 font-bengali text-[13px] font-semibold leading-snug text-foreground">
                      {p.title}
                    </h2>
                    {taka && (
                      <p className="mt-1 font-bengali text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ৳{taka}
                      </p>
                    )}
                    <a
                      href={p.affiliateUrl || p.productUrl}
                      target="_blank"
                      rel="sponsored nofollow noopener noreferrer"
                      className="mt-auto inline-flex h-8 w-full items-center justify-center gap-1 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 px-3 text-xs font-bengali font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                    >
                      কিনুন
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid place-items-center rounded-xl border border-border/60 bg-card p-12 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
              <p className="mt-3 font-bengali text-sm text-muted-foreground">
                এখনও কোনো বই যোগ করা হয়নি।
              </p>
            </div>
          )}

          {/* Support note */}
          <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
              <div>
                <p className="font-bengali text-sm font-semibold text-foreground">
                  আমাদের ভালো কাজকে সাপোর্ট করতে বইটি কিনুন
                </p>
                <p className="mt-1 font-bengali text-xs leading-relaxed text-muted-foreground">
                  «যে জ্ঞানের পথে চলে, আল্লাহ তার জন্য জান্নাতের পথ সহজ করে দেন» — সহিহ মুসলিম।
                  আপনার কেনাকাটায় আন-নূর সামান্য কমিশন পায় — যা এই নিরাপদ, বিজ্ঞাপনমুক্ত অ্যাপ
                  পরিচালনায় ব্যয় হয়।
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <AppFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
