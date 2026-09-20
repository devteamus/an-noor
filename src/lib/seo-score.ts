// SEO score calculator for blog posts
export interface SEOScore {
  score: number;
  checks: { label: string; passed: boolean; tip?: string }[];
}

export function calculateSEOScore(blog: {
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  featureImage: string | null;
}): SEOScore {
  const checks: { label: string; passed: boolean; tip?: string }[] = [];
  const titleLen = blog.title.length;
  checks.push({ label: "শিরোনাম দৈর্ঘ্য (৩০-৭০)", passed: titleLen >= 30 && titleLen <= 70, tip: titleLen < 30 ? "শিরোনাম খুব ছোট" : "শিরোনাম খুব বড়" });
  checks.push({ label: "Meta Title", passed: !!blog.metaTitle });
  const descLen = blog.metaDescription?.length || 0;
  checks.push({ label: "Meta Description (১২০-১৬০)", passed: descLen >= 120 && descLen <= 160, tip: `(${descLen} অক্ষর)` });
  const words = blog.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  checks.push({ label: "কনটেন্ট দৈর্ঘ্য (৩০০+ শব্দ)", passed: words >= 300, tip: `(${words} শব্দ)` });
  checks.push({ label: "ফিচার ইমেজ", passed: !!blog.featureImage });
  const h2Count = (blog.content.match(/<h2/gi) || []).length;
  checks.push({ label: "H2 হেডিং", passed: h2Count >= 1, tip: h2Count === 0 ? "অন্তত ১টি H2 যোগ করুন" : `(${h2Count}টি)` });
  checks.push({ label: "Excerpt", passed: !!blog.excerpt && blog.excerpt.length > 20 });
  const linkCount = (blog.content.match(/<a\s/gi) || []).length;
  checks.push({ label: "ইন্টারনাল লিংক", passed: linkCount >= 3, tip: `${linkCount}টি লিংক` });
  const passedCount = checks.filter((c) => c.passed).length;
  return { score: Math.round((passedCount / checks.length) * 100), checks };
}
