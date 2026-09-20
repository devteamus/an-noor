// আমলের পরিসংখ্যান — দুআ কাউন্টার + লাইভ তসবিহ দুটো মিলিয়ে হিসাব
// Home-এর স্মার্ট সারসংক্ষেপ কার্ড ও ইতিহাস পেজ একসঙ্গে ব্যবহার করে।
import type { CountsMap, TasbihCountsMap } from "@/lib/store";

export interface DailyEntry {
  dateKey: string;
  total: number;
}

export interface AmalStats {
  /** তারিখ -> মোট আমল (দুআ + তসবিহ) */
  byDate: Record<string, number>;
  grandTotal: number;
  todayTotal: number;
  totalDays: number;
  avgPerDay: number;
  /** টানা কতদিন আমল হয়েছে (আজ/গতকাল পর্যন্ত হিসাব) */
  streak: number;
  /** শেষ ৭ দিনের অ্যাক্টিভিটি (পুরনো থেকে নতুন) */
  last7: { dateKey: string; total: number }[];
}

export function makeTodayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d + delta);
  return makeTodayKey(dt);
}

/** দুআ counts + তসবিহ tasbihCounts মিলিয়ে দৈনিক মোট হিসাব */
export function computeAmalStats(
  counts: CountsMap,
  tasbihCounts: TasbihCountsMap
): AmalStats {
  const byDate: Record<string, number> = {};
  for (const perDua of Object.values(counts)) {
    for (const [dateKey, c] of Object.entries(perDua ?? {})) {
      byDate[dateKey] = (byDate[dateKey] ?? 0) + c;
    }
  }
  for (const perDhikr of Object.values(tasbihCounts)) {
    for (const [dateKey, c] of Object.entries(perDhikr ?? {})) {
      byDate[dateKey] = (byDate[dateKey] ?? 0) + c;
    }
  }

  const todayKey = makeTodayKey();
  const grandTotal = Object.values(byDate).reduce((a, b) => a + b, 0);
  const totalDays = Object.keys(byDate).length;
  const avgPerDay = totalDays > 0 ? Math.round(grandTotal / totalDays) : 0;

  // ধারাবাহিকতা: আজ থেকে পেছনে গুনে যেখানে আমল আছে টানা।
  // আজ না থাকলে গতকাল থেকে শুরু (আজকের দিনটা এখনও শেষ হয়নি)।
  let streak = 0;
  let cursor = (byDate[todayKey] ?? 0) > 0 ? todayKey : addDays(todayKey, -1);
  while ((byDate[cursor] ?? 0) > 0) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const dateKey = addDays(todayKey, i - 6);
    return { dateKey, total: byDate[dateKey] ?? 0 };
  });

  return {
    byDate,
    grandTotal,
    todayTotal: byDate[todayKey] ?? 0,
    totalDays,
    avgPerDay,
    streak,
    last7,
  };
}
