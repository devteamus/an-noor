"use client";

import * as React from "react";
import { useAppStore, paramsToView, type View } from "@/lib/store";
import { AppHeader } from "@/components/app/header";
import { AppFooter } from "@/components/app/footer";
import { WelcomeNotification } from "@/components/app/welcome-notification";
import { HomeView } from "@/components/app/home-view";
import { CategoryView } from "@/components/app/category-view";
import { CounterView } from "@/components/app/counter-view";
import { HistoryView } from "@/components/app/history-view";
import { NamesOfAllahView } from "@/components/app/names-of-allah-view";
import { RuqyahView } from "@/components/app/ruqyah-view";
import { NamazView } from "@/components/app/namaz-view";
import { BlogView } from "@/components/app/blog-view";
import { BlogPostView } from "@/components/app/blog-post-view";
import { ShopView } from "@/components/app/shop-view";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";

// অ্যাডমিন ভিউ শুধু admin login/dashboard দেখলেই লাগে — সাধারণ ভিজিটরদের
// initial JS bundle-এ এটা (recharts, admin-শপ, অ্যাফিলিয়েট ম্যানেজার ইত্যাদি
// ভারী dependency) টেনে আনা অপ্রয়োজনীয়, তাই dynamic import দিয়ে আলাদা চাঙ্কে রাখা হচ্ছে
const AdminLoginView = dynamic(
  () => import("@/components/app/admin-login-view").then((m) => m.AdminLoginView),
  { ssr: false }
);
const AdminDashboardView = dynamic(
  () => import("@/components/app/admin-dashboard-view").then((m) => m.AdminDashboardView),
  { ssr: false }
);

export default function Home() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  // On first mount: sync view from URL query params
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlView = paramsToView(params);
    if (urlView && JSON.stringify(urlView) !== JSON.stringify(view)) {
      setView(urlView);
    }
  }, []);

  // Listen to browser back/forward
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      const urlView = paramsToView(params);
      if (urlView) {
        setView(urlView);
      } else {
        setView({ name: "home" });
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [setView]);

  const viewKey =
    view.name === "home"
      ? "home"
      : view.name === "category"
        ? `cat-${view.categoryId}`
        : view.name === "counter"
          ? `cnt-${view.duaId}`
          : view.name === "blog"
            ? `blog-${view.page}-${view.category || ""}`
            : view.name === "blog-post"
              ? `post-${view.slug}`
              : view.name === "shop"
                ? `shop-${view.page || 1}`
                : view.name;

  // Wider container for blog grid + blog post (full-width) + shop grid
  const isWider =
    view.name === "blog" ||
    view.name === "blog-post" ||
    view.name === "shop";

  return (
    <div className="flex min-h-screen flex-col pattern-bg">
      <AppHeader />
      <WelcomeNotification />
      <main className="flex-1">
        <div
          className={
            isWider
              ? "mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-7"
              : "mx-auto w-full max-w-5xl px-3 py-5 sm:px-6 sm:py-7"
          }
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={viewKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <ViewRenderer view={view} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

function ViewRenderer({ view }: { view: View }) {
  switch (view.name) {
    case "home":
      return <HomeView />;
    case "category":
      return <CategoryView categoryId={view.categoryId} />;
    case "counter":
      return <CounterView duaId={view.duaId} />;
    case "history":
      return <HistoryView />;
    case "names-of-allah":
      return <NamesOfAllahView />;
    case "ruqyah":
      return <RuqyahView />;
    case "namaz":
      return <NamazView />;
    case "blog":
      return (
        <BlogView
          initialPage={view.page ?? 1}
          initialCategory={view.category}
        />
      );
    case "blog-post":
      return <BlogPostView slug={view.slug} />;
    case "shop":
      return <ShopView initialPage={view.page ?? 1} />;
    case "admin-login":
      return <AdminLoginView />;
    case "admin-dashboard":
      return <AdminDashboardView />;
    default:
      return <HomeView />;
  }
}
