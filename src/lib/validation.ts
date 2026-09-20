// Input validation using zod + HTML sanitizer
import { z } from "zod";

export const blogCreateSchema = z.object({
  title: z.string().trim().min(3, "শিরোনাম কমপক্ষে ৩ অক্ষরের হতে হবে।").max(300),
  content: z.string().trim().min(10, "বিষয়বস্তু কমপক্ষে ১০ অক্ষরের হতে হবে।").max(200_000),
  featureImage: z.string().trim().url("ফিচার ইমেজ একটি বৈধ URL হতে হবে।").optional().or(z.literal("")),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  published: z.boolean().optional().default(true),
  scheduledAt: z.union([z.string(), z.null()]).optional().transform((v) => { if (!v) return null; const d = new Date(v); return isNaN(d.getTime()) ? null : d; }),
});

export const blogUpdateSchema = blogCreateSchema.partial();

export const csvRowSchema = z.object({
  title: z.string().trim().min(3).max(300),
  content: z.string().trim().min(10).max(200_000),
  featureImage: z.string().trim().optional().or(z.literal("")),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  schedule: z.string().trim().optional().or(z.literal("")),
});

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2, "ক্যাটাগরি নাম কমপক্ষে ২ অক্ষরের।").max(60),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("বৈধ ইমেইল দিন।"),
  password: z.string().min(4, "পাসওয়ার্ড দিন।").max(200),
});

export const affiliateUrlSchema = z.object({
  url: z.string().trim().url("বৈধ URL দিন।").refine((u) => u.startsWith("http://") || u.startsWith("https://"), "URL http:// বা https:// দিয়ে শুরু হতে হবে।"),
  category: z.enum(["food", "book"], { message: "ক্যাটাগরি 'food' বা 'book' হতে হবে।" }),
});

const ALLOWED_TAGS = new Set(["p","br","hr","h1","h2","h3","h4","h5","h6","ul","ol","li","blockquote","pre","code","strong","b","em","i","u","s","del","ins","mark","small","sub","sup","a","img","table","thead","tbody","tr","th","td","div","span","figure","figcaption"]);
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href","title","target","rel","data-interlink"]),
  img: new Set(["src","alt","title","width","height","loading"]),
  "*": new Set(["class","style"]),
};

export function sanitizeBlogHtml(html: string): string {
  if (!html) return "";
  let out = html.replace(/<(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select)\b[\s\S]*?<\/\1\s*>/gi, "");
  out = out.replace(/<(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select)\b[^>]*\/?>/gi, "");
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)\/?>/g, (whole, tagRaw, attrStr) => {
    const tag = tagRaw.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    const isClosing = whole.trim().startsWith("</");
    if (isClosing) return `</${tag}>`;
    const attrRegex = /([a-zA-Z_:][a-zA-Z0-9_:.-]*)\s*(?:=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    const kept: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = attrRegex.exec(attrStr)) !== null) {
      const attrName = m[1].toLowerCase();
      const attrVal = m[3] ?? m[4] ?? m[5] ?? "";
      if (attrName.startsWith("on")) continue;
      const allowSet = ALLOWED_ATTRS[tag] ?? ALLOWED_ATTRS["*"];
      const globalSet = ALLOWED_ATTRS["*"];
      if (!allowSet.has(attrName) && !globalSet.has(attrName)) continue;
      if ((attrName === "href" || attrName === "src") && attrVal) {
        const v = attrVal.trim().toLowerCase();
        if (v.startsWith("javascript:") || v.startsWith("data:text/html")) continue;
      }
      kept.push(`${attrName}="${attrVal.replace(/"/g, "&quot;")}"`);
    }
    const selfClose = whole.trim().endsWith("/>") ? " /" : "";
    return kept.length ? `<${tag} ${kept.join(" ")}${selfClose}>` : `<${tag}${selfClose}>`;
  });
  return out;
}
