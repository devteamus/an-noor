"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, Sparkles } from "lucide-react";

const STORAGE_KEY = "annoor-welcomed";

export function WelcomeNotification() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    try {
      const seen = sessionStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // small delay so it animates in after page load
        const t = setTimeout(() => setShow(true), 500);
        return () => clearTimeout(t);
      }
    } catch {
      // ignore
    }
  }, []);

  const dismiss = React.useCallback(() => {
    setShow(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  // auto-dismiss after 7 seconds
  React.useEffect(() => {
    if (!show) return;
    const t = setTimeout(dismiss, 7000);
    return () => clearTimeout(t);
  }, [show, dismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          className="fixed left-1/2 top-20 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-background/95 p-5 shadow-2xl backdrop-blur-xl">
            {/* decorative gradient */}
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl" />

            {/* close */}
            <button
              onClick={dismiss}
              className="absolute right-3 top-3 grid h-7 w-7 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
              aria-label="বন্ধ করুন"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative flex items-start gap-3">
              <motion.span
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg"
              >
                <ShieldCheck className="h-6 w-6" />
              </motion.span>
              <div className="min-w-0 flex-1">
                <p className="font-bengali text-base font-bold text-foreground">
                  আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ 🌿
                </p>
                <p className="mt-1.5 font-bengali text-sm leading-relaxed text-foreground/85">
                  আন-নূর অ্যাপে স্বাগতম। এই অ্যাপটি{" "}
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    সম্পূর্ণ বিজ্ঞাপন মুক্ত
                  </strong>{" "}
                  এবং{" "}
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    নিরাপদ
                  </strong>
                  । আপনার সমস্ত আমলের হিসাব শুধু আপনার ব্রাউজারেই সংরক্ষিত থাকে।
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <p className="font-bengali text-[11px] text-muted-foreground">
                    আল্লাহ আপনার সব আমল কবুল করুন। আমিন।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
