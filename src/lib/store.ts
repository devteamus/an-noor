// আন-নূর — Zustand store with localStorage persistence
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type View =
  | { name: "home" }
  | { name: "category"; categoryId: string }
  | { name: "counter"; duaId: string }
  | { name: "history" }
  | { name: "names-of-allah" }
  | { name: "ruqyah" }
  | { name: "namaz" }
  | { name: "blog"; page?: number; category?: string }
  | { name: "blog-post"; slug: string }
  | { name: "shop"; page?: number }
  | { name: "admin-login" }
  | { name: "admin-dashboard" };

// counts[duaId][YYYY-MM-DD] = number
export type CountsMap = Record<string, Record<string, number>>;
// liveTasbih: goals[dhikrId] = target; tasbihCounts[dhikrId][YYYY-MM-DD] = count
export type TasbihGoals = Record<string, number>;
export type TasbihCountsMap = Record<string, Record<string, number>>;

interface AppState {
  view: View;
  counts: CountsMap;
  // live tasbih
  tasbihGoals: TasbihGoals;
  tasbihCounts: TasbihCountsMap;
  tasbihPanelOpen: boolean;
  tasbihActiveDhikr: string; // id of currently selected dhikr in panel
  // navigation
  setView: (view: View) => void;
  goHome: () => void;
  goCategory: (categoryId: string) => void;
  goCounter: (duaId: string) => void;
  goHistory: () => void;
  goNamesOfAllah: () => void;
  goRuqyah: () => void;
  goNamaz: () => void;
  goBlog: (page?: number, category?: string) => void;
  goBlogPost: (slug: string) => void;
  goShop: (page?: number) => void;
  goAdminLogin: () => void;
  goAdminDashboard: () => void;
  // counter actions
  increment: (duaId: string) => void;
  resetToday: (duaId: string) => void;
  setCountToday: (duaId: string, count: number) => void;
  // helpers
  getTodayCount: (duaId: string) => number;
  getTotalCount: (duaId: string) => number;
  resetAll: () => void;
  // live tasbih actions
  tasbihIncrement: (dhikrId: string) => void;
  tasbihReset: (dhikrId: string) => void;
  tasbihSetGoal: (dhikrId: string, goal: number) => void;
  getTasbihTodayCount: (dhikrId: string) => number;
  getTasbihGoal: (dhikrId: string, fallback: number) => number;
  setTasbihPanelOpen: (open: boolean) => void;
  setTasbihActiveDhikr: (id: string) => void;
}

function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* ---------- URL <-> view sync (for shareable blog links) ---------- */
function viewToParams(view: View): URLSearchParams {
  const p = new URLSearchParams();
  p.set("view", view.name);
  if (view.name === "category") p.set("categoryId", view.categoryId);
  else if (view.name === "counter") p.set("duaId", view.duaId);
  else if (view.name === "blog") {
    if (view.page) p.set("page", String(view.page));
    if (view.category) p.set("category", view.category);
  } else if (view.name === "blog-post") p.set("slug", view.slug);
  else if (view.name === "shop") {
    if (view.page) p.set("page", String(view.page));
  }
  return p;
}

export function paramsToView(p: URLSearchParams): View | null {
  const name = p.get("view");
  if (!name) return null;
  if (name === "category")
    return { name: "category", categoryId: p.get("categoryId") || "" };
  if (name === "counter")
    return { name: "counter", duaId: p.get("duaId") || "" };
  if (name === "blog")
    return {
      name: "blog",
      page: p.get("page") ? Number(p.get("page")) : 1,
      category: p.get("category") || undefined,
    };
  if (name === "blog-post")
    return { name: "blog-post", slug: p.get("slug") || "" };
  if (name === "shop")
    return {
      name: "shop",
      page: p.get("page") ? Number(p.get("page")) : 1,
    };
  if (name === "names-of-allah") return { name: "names-of-allah" };
  if (name === "ruqyah") return { name: "ruqyah" };
  if (name === "namaz") return { name: "namaz" };
  if (name === "admin-login") return { name: "admin-login" };
  if (name === "admin-dashboard") return { name: "admin-dashboard" };
  if (name === "history") return { name: "history" };
  if (name === "home") return { name: "home" };
  return null;
}

function pushUrl(view: View) {
  if (typeof window === "undefined") return;
  const params = viewToParams(view);
  // SPA ভিউ শুধু "/" পেজেই রেন্ডার হয়। আলাদা রুটে (যেমন /privacy, /contact)
  // থেকে নেভিগেট করলে সত্যিকারের পেজ-লোড দরকার — নাহলে URL ভাঙে।
  if (window.location.pathname !== "/") {
    window.location.assign(`/?${params.toString()}`);
    return;
  }
  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({ view: view.name }, "", url);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: { name: "home" },
      counts: {},
      tasbihGoals: {},
      tasbihCounts: {},
      tasbihPanelOpen: false,
      tasbihActiveDhikr: "subhanallah",

      setView: (view) => {
        pushUrl(view);
        set({ view });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
      goHome: () => get().setView({ name: "home" }),
      goCategory: (categoryId) => get().setView({ name: "category", categoryId }),
      goCounter: (duaId) => get().setView({ name: "counter", duaId }),
      goHistory: () => get().setView({ name: "history" }),
      goNamesOfAllah: () => get().setView({ name: "names-of-allah" }),
      goRuqyah: () => get().setView({ name: "ruqyah" }),
      goNamaz: () => get().setView({ name: "namaz" }),
      goBlog: (page = 1, category) => {
        // SEO: ব্লগ লিস্ট এখন সার্ভার-রেন্ডার্ড /blog পেজ — ইনডেক্সযোগ্য canonical URL
        const params = new URLSearchParams();
        if (page > 1) params.set("page", String(page));
        if (category) params.set("category", category);
        const qs = params.toString();
        window.location.assign(`/blog${qs ? `?${qs}` : ""}`);
      },
      goBlogPost: (slug) => {
        // SEO: প্রতিটি পোস্টের একটাই canonical URL — /blog/[slug] (সার্ভার-রেন্ডার্ড)
        window.location.assign(`/blog/${encodeURIComponent(slug)}`);
      },
      goShop: () => {
        // SEO: বইয়ের শপ সার্ভার-রেন্ডার্ড /books পেজে
        window.location.assign("/books");
      },
      goAdminLogin: () => get().setView({ name: "admin-login" }),
      goAdminDashboard: () => get().setView({ name: "admin-dashboard" }),

      increment: (duaId) => {
        const key = todayKey();
        const counts = { ...get().counts };
        const perDua = { ...(counts[duaId] ?? {}) };
        perDua[key] = (perDua[key] ?? 0) + 1;
        counts[duaId] = perDua;
        set({ counts });
      },

      resetToday: (duaId) => {
        const key = todayKey();
        const counts = { ...get().counts };
        const perDua = { ...(counts[duaId] ?? {}) };
        perDua[key] = 0;
        counts[duaId] = perDua;
        set({ counts });
      },

      setCountToday: (duaId, count) => {
        const key = todayKey();
        const counts = { ...get().counts };
        const perDua = { ...(counts[duaId] ?? {}) };
        perDua[key] = Math.max(0, count);
        counts[duaId] = perDua;
        set({ counts });
      },

      getTodayCount: (duaId) => {
        const key = todayKey();
        return get().counts[duaId]?.[key] ?? 0;
      },

      getTotalCount: (duaId) => {
        const perDua = get().counts[duaId];
        if (!perDua) return 0;
        return Object.values(perDua).reduce((a, b) => a + b, 0);
      },

      resetAll: () => set({ counts: {}, tasbihCounts: {} }),

      // ---------- live tasbih ----------
      tasbihIncrement: (dhikrId) => {
        const key = todayKey();
        const tasbihCounts = { ...get().tasbihCounts };
        const perDhikr = { ...(tasbihCounts[dhikrId] ?? {}) };
        perDhikr[key] = (perDhikr[key] ?? 0) + 1;
        tasbihCounts[dhikrId] = perDhikr;
        set({ tasbihCounts });
      },
      tasbihReset: (dhikrId) => {
        const key = todayKey();
        const tasbihCounts = { ...get().tasbihCounts };
        const perDhikr = { ...(tasbihCounts[dhikrId] ?? {}) };
        perDhikr[key] = 0;
        tasbihCounts[dhikrId] = perDhikr;
        set({ tasbihCounts });
      },
      tasbihSetGoal: (dhikrId, goal) => {
        const tasbihGoals = { ...get().tasbihGoals };
        tasbihGoals[dhikrId] = Math.max(1, goal);
        set({ tasbihGoals });
      },
      getTasbihTodayCount: (dhikrId) => {
        const key = todayKey();
        return get().tasbihCounts[dhikrId]?.[key] ?? 0;
      },
      getTasbihGoal: (dhikrId, fallback) => {
        return get().tasbihGoals[dhikrId] ?? fallback;
      },
      setTasbihPanelOpen: (open) => set({ tasbihPanelOpen: open }),
      setTasbihActiveDhikr: (id) => set({ tasbihActiveDhikr: id }),
    }),
    {
      name: "annoor-store",
      version: 2,
      partialize: (state) =>
        ({
          counts: state.counts,
          tasbihGoals: state.tasbihGoals,
          tasbihCounts: state.tasbihCounts,
        }) as AppState,
    }
  )
);

export function todayKeyExport(): string {
  return todayKey();
}
