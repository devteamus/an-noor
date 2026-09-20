import type { Metadata } from "next";
import { LegalPageShell } from "@/components/app/legal-page";
import { PRIVACY_BODY } from "@/lib/legal-content";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

export const metadata: Metadata = {
  title: "প্রাইভেসি পলিসি",
  description:
    "আন-নূর অ্যাপের প্রাইভেসি পলিসি — কোনো ব্যক্তিগত তথ্য সংগ্রহ নেই, আপনার আমলের হিসাব শুধু আপনার ব্রাউজারে সংরক্ষিত থাকে।",
  alternates: { canonical: BASE_URL + "/privacy" },
  openGraph: {
    title: "প্রাইভেসি পলিসি · আন-নূর",
    description:
      "কোনো ব্যক্তিগত তথ্য সংগ্রহ নেই — আপনার আমলের হিসাব শুধু আপনার ব্রাউজারে।",
    url: BASE_URL + "/privacy",
  },
};

export default function PrivacyPage() {
  return <LegalPageShell title="প্রাইভেসি পলিসি" icon="shield" body={PRIVACY_BODY} />;
}
