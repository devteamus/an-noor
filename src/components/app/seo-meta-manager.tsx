"use client";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://annoor.xyz";
interface SeoMeta { title: string; description: string; canonical?: string; ogType?: "website" | "article"; }
function getSeoForView(view: ReturnType<typeof useAppStore.getState>["view"]): SeoMeta {
  switch (view.name) {
    case "home": return { title: "আন-নূর — দুআ কাউন্টার, তসবিহ ও ইসলামিক ব্লগ", description: "লাইভ দুআ কাউন্টার, ডিজিটাল তসবিহ, আল্লাহর ৯৯ নাম, রুকইয়াহ, পাঁচ ওয়াক্ত নামাজের নিয়ম ও ইসলামিক ব্লগ। সম্পূর্ণ বিজ্ঞাপন মুক্ত ও নিরাপদ।", canonical: BASE_URL + "/", ogType: "website" };
    case "names-of-allah": return { title: "আল্লাহর ৯৯ নাম — আসমাউল হুসনা (অডিও সহ)", description: "মহান আল্লাহর সর্বোচ্চ নাম ও ৯৯টি সুন্দর নাম। প্রতিটি নামের আরবি, বাংলা উচ্চারণ, অর্থ ও অডিও।", canonical: BASE_URL + "/?view=names-of-allah", ogType: "article" };
    case "ruqyah": return { title: "রুকইয়াহ — কুরআন ও দুআ দ্বারা চিকিৎসা", description: "রিজিকের বাধা দূর করা, বদনজর, হিংসা ও কালো যাদু থেকে মুক্তির শক্তিশালী রুকইয়াহ।", canonical: BASE_URL + "/?view=ruqyah", ogType: "article" };
    case "namaz": return { title: "পাঁচ ওয়াক্ত নামাজ পড়ার নিয়ম — ভিডিও সহ", description: "ফজর, যোহর, আসর, মাগরিব ও এশা — পাঁচ ওয়াক্ত ফরজ নামাজ পড়ার নিয়ম প্রতিটি আলাদা ভিডিও সহ।", canonical: BASE_URL + "/?view=namaz", ogType: "article" };
    case "shop": return { title: "Islamic Books — ইসলামিক বইয়ের অনলাইন শপ", description: "বিশুদ্ধ ইসলামিক বইয়ের সংগ্রহ। রকমারি থেকে সরাসরি কিনতে পারেন।", canonical: BASE_URL + "/?view=shop", ogType: "website" };
    case "blog": return { title: "ইসলামিক ব্লগ — আর্টিকেল ও জ্ঞান ভাণ্ডার", description: "কুরআন, হাদিস ও ইসলামিক জ্ঞান ভিত্তিক আর্টিকেল। স্বয়ংক্রিয় ইন্টারলিংকিং ও সম্পর্কিত লেখা সহ।", canonical: BASE_URL + "/?view=blog", ogType: "website" };
    case "history": return { title: "আমলের ইতিহাস — তারিখ অনুযায়ী হিসাব", description: "কোন তারিখে কোন দুআ কতবার পড়েছেন তার বিস্তারিত হিসাব।", canonical: BASE_URL + "/?view=history", ogType: "website" };
    default: return { title: "আন-নূর", description: "দুআ কাউন্টার ও ইসলামিক ব্লগ।", canonical: BASE_URL + "/", ogType: "website" };
  }
}
function setMeta(attr: "name" | "property", key: string, content: string) {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute("content", content);
}
function setLink(rel: string, href: string) {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement("link"); el.setAttribute("rel", rel); document.head.appendChild(el); }
  el.setAttribute("href", href);
}
function setJsonLd(id: string, data: object) {
  if (typeof document === "undefined") return;
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) { el = document.createElement("script"); el.id = id; el.setAttribute("type", "application/ld+json"); document.head.appendChild(el); }
  el.textContent = JSON.stringify(data);
}
export function SeoMetaManager() {
  const view = useAppStore((s) => s.view);
  useEffect(() => {
    const seo = getSeoForView(view);
    document.title = seo.title;
    setMeta("name", "description", seo.description);
    if (seo.canonical) setLink("canonical", seo.canonical);
    setMeta("property", "og:title", seo.title);
    setMeta("property", "og:description", seo.description);
    setMeta("property", "og:type", seo.ogType ?? "website");
    setMeta("property", "og:url", seo.canonical ?? BASE_URL);
    setMeta("property", "og:locale", "bn_BD");
    setMeta("property", "og:site_name", "আন-নূর");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", seo.title);
    setMeta("name", "twitter:description", seo.description);
    setJsonLd("ld-website", { "@context": "https://schema.org", "@type": "WebSite", name: "আন-নূর", url: BASE_URL, description: seo.description, inLanguage: "bn-BD", publisher: { "@type": "Person", name: "Faisal Hossain", url: "https://www.linkedin.com/in/ifaisalh" } });
  }, [view]);
  return null;
}
