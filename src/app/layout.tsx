import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Amiri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const amiri = Amiri({ variable: "--font-arabic", subsets: ["arabic", "latin"], weight: ["400", "700"], display: "swap" });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: "আন-নূর — দুআ কাউন্টার, তসবিহ ও ইসলামিক ব্লগ", template: "%s · আন-নূর" },
  description: "আন-নূর — লাইভ দুআ কাউন্টার, ডিজিটাল তসবিহ, আল্লাহর ৯৯ নাম, রুকইয়াহ, পাঁচ ওয়াক্ত নামাজের নিয়ম ও ইসলামিক ব্লগ। আরবি, অর্থ ও ফজিলত সহ। সম্পূর্ণ বিজ্ঞাপন মুক্ত ও নিরাপদ।",
  keywords: ["দুআ কাউন্টার","তসবিহ","তসবিহ কাউন্টার","ডিজিটাল তসবিহ","জিকির","আমল","আল্লাহর ৯৯ নাম","আসমাউল হুসনা","রুকইয়াহ","নামাজের নিয়ম","ইসলামিক ব্লগ","ইসলাম","Dua Counter","Tasbih Counter","Digital Tasbih","Islamic Blog","99 Names of Allah","Ruqyah"],
  authors: [{ name: "Faisal Hossain", url: "https://www.linkedin.com/in/ifaisalh" }],
  creator: "Faisal Hossain",
  publisher: "Faisal Hossain",
  manifest: "/manifest.json",
  applicationName: "আন-নূর",
  category: "Islamic",
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/icon.svg" },
  alternates: { canonical: BASE_URL + "/" },
  openGraph: {
    type: "website", locale: "bn_BD", url: BASE_URL + "/", siteName: "আন-নূর",
    title: "আন-নূর — দুআ কাউন্টার, তসবিহ ও ইসলামিক ব্লগ",
    description: "লাইভ দুআ কাউন্টার, ডিজিটাল তসবিহ, আল্লাহর ৯৯ নাম, রুকইয়াহ, নামাজের নিয়ম ও ইসলামিক ব্লগ। সম্পূর্ণ বিজ্ঞাপন মুক্ত ও নিরাপদ।",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "আন-নূর — দুআ কাউন্টার, তসবিহ ও ইসলামিক ব্লগ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "আন-নূর — দুআ কাউন্টার ও ইসলামিক ব্লগ",
    description: "লাইভ দুআ কাউন্টার, ডিজিটাল তসবিহ, আল্লাহর ৯৯ নাম, রুকইয়াহ ও ইসলামিক ব্লগ।",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = { themeColor: "#10b981", width: "device-width", initialScale: 1, maximumScale: 5 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.maateen.com/kalpurush.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} font-bengali antialiased bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
