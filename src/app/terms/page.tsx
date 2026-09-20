import type { Metadata } from "next";
import { LegalPageShell } from "@/components/app/legal-page";
import { TERMS_BODY } from "@/lib/legal-content";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

export const metadata: Metadata = {
  title: "শর্তাবলী",
  description:
    "আন-নূর অ্যাপ ব্যবহারের শর্তাবলী — উদ্দেশ্য, রুকইয়াহ, কনটেন্ট, দায়বদ্ধতা ও কপিরাইট সম্পর্কিত নীতিমালা।",
  alternates: { canonical: BASE_URL + "/terms" },
  openGraph: {
    title: "শর্তাবলী · আন-নূর",
    description: "আন-নূর অ্যাপ ব্যবহারের শর্তাবলী ও নীতিমালা।",
    url: BASE_URL + "/terms",
  },
};

export default function TermsPage() {
  return <LegalPageShell title="শর্তাবলী" icon="file" body={TERMS_BODY} />;
}
