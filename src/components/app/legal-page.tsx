import Link from "next/link";
import { AppHeader } from "@/components/app/header";
import { AppFooter } from "@/components/app/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Shield,
  FileText,
  Mail,
  Facebook,
  User,
  CalendarClock,
  ExternalLink,
} from "lucide-react";
import {
  parseLegalBody,
  CONTACT,
  type LegalDoc,
} from "@/lib/legal-content";

/** বাংলা মাসের নাম সহ "সর্বশেষ হালনাগাদ" ব্যাজ */
function lastUpdatedBadge(): string {
  const now = new Date();
  const months = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
  ];
  const bnDigits = (n: number) =>
    String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
  return `${months[now.getMonth()]} ${bnDigits(now.getFullYear())}`;
}

/**
 * আইনি পেজের শেয়ার্ড লেআউট — হেডার, কনটেন্ট কার্ড, ফুটার।
 * /privacy ও /terms পেজে ব্যবহৃত হয় (যোগাযোগ পেজের নিজস্ব ডিজাইন আছে)।
 */
export function LegalPageShell({
  title,
  icon,
  body,
}: {
  title: string;
  icon: "shield" | "file";
  body: string;
}) {
  const doc: LegalDoc = parseLegalBody(body);
  const Icon = icon === "shield" ? Shield : FileText;

  return (
    <div className="flex min-h-screen flex-col pattern-bg">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-6 sm:py-7">
          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-bengali text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            মূল পেজে ফিরুন
          </Link>

          <Card className="mt-3 overflow-hidden border-border/70">
            {/* Header band */}
            <div className="flex items-center gap-3 border-b border-border/60 bg-gradient-to-br from-emerald-500/[0.07] via-teal-500/[0.04] to-amber-500/[0.05] px-4 py-5 sm:px-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h1 className="font-bengali text-xl font-bold leading-tight text-foreground sm:text-2xl">
                  {title}
                </h1>
                <p className="mt-0.5 flex items-center gap-1 font-bengali text-[11px] text-muted-foreground">
                  <CalendarClock className="h-3 w-3" />
                  সর্বশেষ হালনাগাদ: {lastUpdatedBadge()}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-4 py-5 sm:px-6 sm:py-6">
              {doc.intro && (
                <p className="whitespace-pre-line font-bengali text-sm leading-relaxed text-foreground/90">
                  {doc.intro}
                </p>
              )}

              <div className="mt-4 space-y-4">
                {doc.sections.map((s) => (
                  <section
                    key={s.no}
                    className="rounded-xl border border-border/50 bg-muted/20 p-3.5 sm:p-4"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/15 font-bengali text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        {s.no}
                      </span>
                      <div className="min-w-0 flex-1">
                        {s.heading && (
                          <h2 className="font-bengali text-sm font-bold text-foreground">
                            {s.heading}
                          </h2>
                        )}
                        <p className="mt-0.5 font-bengali text-[13px] leading-relaxed text-foreground/80">
                          {s.text}
                        </p>
                      </div>
                    </div>
                  </section>
                ))}
              </div>

              {doc.outro && (
                <p className="mt-4 font-bengali text-sm leading-relaxed text-foreground/90">
                  {doc.outro}
                </p>
              )}
            </div>
          </Card>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

/** যোগাযোগ পেজের শেল — নিজস্ব ডিজাইন */
export function ContactPageShell() {
  return (
    <div className="flex min-h-screen flex-col pattern-bg">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-6 sm:py-7">
          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-bengali text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            মূল পেজে ফিরুন
          </Link>

          <Card className="mt-3 overflow-hidden border-border/70">
            {/* Header band */}
            <div className="flex items-center gap-3 border-b border-border/60 bg-gradient-to-br from-emerald-500/[0.07] via-teal-500/[0.04] to-amber-500/[0.05] px-4 py-5 sm:px-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                <Mail className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h1 className="font-bengali text-xl font-bold leading-tight text-foreground sm:text-2xl">
                  যোগাযোগ
                </h1>
                <p className="mt-0.5 font-bengali text-[11px] text-muted-foreground">
                  প্রশ্ন, পরামর্শ বা ত্রুটি জানাতে আমাদের লিখুন
                </p>
              </div>
            </div>

            <div className="px-4 py-5 sm:px-6 sm:py-6">
              <p className="font-bengali text-sm leading-relaxed text-foreground/90">
                আসসালামু আলাইকুম। আন-নূর অ্যাপ সম্পর্কে যেকোনো প্রশ্ন, পরামর্শ
                বা ত্রুটি জানাতে নিচের যেকোনো মাধ্যমে যোগাযোগ করুন। আমরা
                ইনশাআল্লাহ শীঘ্রই সাড়া দেওয়ার চেষ্টা করব।
              </p>

              {/* Contact cards */}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center">
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    <User className="h-5 w-5" />
                  </span>
                  <p className="mt-2 font-bengali text-[11px] text-muted-foreground">
                    নির্মাতা
                  </p>
                  <p className="font-bengali text-sm font-bold text-foreground">
                    {CONTACT.name}
                  </p>
                </div>

                <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center">
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    <Mail className="h-5 w-5" />
                  </span>
                  <p className="mt-2 font-bengali text-[11px] text-muted-foreground">
                    ইমেইল
                  </p>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="block truncate font-bengali text-sm font-bold text-foreground underline-offset-2 hover:underline"
                  >
                    {CONTACT.email}
                  </a>
                  <Button
                    asChild
                    size="sm"
                    className="mt-2.5 w-full gap-1 font-bengali text-xs cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <a href={`mailto:${CONTACT.email}`}>
                      <Mail className="h-3.5 w-3.5" />
                      ইমেইল পাঠান
                    </a>
                  </Button>
                </div>

                <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center">
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300">
                    <Facebook className="h-5 w-5" />
                  </span>
                  <p className="mt-2 font-bengali text-[11px] text-muted-foreground">
                    ফেসবুক
                  </p>
                  <a
                    href={CONTACT.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate font-bengali text-sm font-bold text-foreground underline-offset-2 hover:underline"
                  >
                    {CONTACT.facebookDisplay}
                  </a>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="mt-2.5 w-full gap-1 font-bengali text-xs cursor-pointer"
                  >
                    <a
                      href={CONTACT.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      মেসেজ করুন
                    </a>
                  </Button>
                </div>
              </div>

              <p className="mt-5 text-center font-bengali text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                জাযাকাল্লাহু খাইরান।
              </p>
            </div>
          </Card>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
