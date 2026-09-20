import type { Metadata } from "next";
import { ContactPageShell } from "@/components/app/legal-page";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

export const metadata: Metadata = {
  title: "যোগাযোগ",
  description:
    "আন-নূর অ্যাপ সম্পর্কে প্রশ্ন, পরামর্শ বা ত্রুটি জানাতে যোগাযোগ করুন — নির্মাতা ফয়সাল হোসেন, ইমেইল ও ফেসবুক।",
  alternates: { canonical: BASE_URL + "/contact" },
  openGraph: {
    title: "যোগাযোগ · আন-নূর",
    description: "প্রশ্ন, পরামর্শ বা ত্রুটি জানাতে আমাদের সাথে যোগাযোগ করুন।",
    url: BASE_URL + "/contact",
  },
};

export default function ContactPage() {
  return <ContactPageShell />;
}
