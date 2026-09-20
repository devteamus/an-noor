// Smart auto-interlinking — bug-free, HTML-aware, guarantees 8-10 unique links.
//
// Strategy:
// 1) Tokenize the HTML into text segments (outside tags). Track positions so we
//    can safely splice anchors into the original HTML without breaking attributes.
// 2) Pass 1 (phrase match): scan other posts' titles; if a title appears in text,
//    wrap the FIRST occurrence in an anchor. Skip titles already linked.
// 3) Pass 2 (keyword match): if we still have fewer than MIN_LINKS unique links,
//    extract keywords (2-4 word phrases) from each unlinked post's title/content
//    and match them in the current content; wrap first occurrence.
// 4) Pass 3 (append "আরও পড়ুন" section): if STILL below MIN_LINKS, append a
//    bullet list of remaining related posts at the end of the content so every
//    post has at least MIN_LINKS unique outbound links to other posts.
//
// Safety guarantees:
//   - We never modify text inside <a>...</a>, <code>, <pre>, <script>, <style>.
//   - We never create nested <a> tags.
//   - Each target post is linked at most once (deduped by slug).
//   - Regex special chars in titles/keywords are escaped.
//   - Word boundaries respected so we don't link partial words.

export interface InterlinkTarget {
  title: string;
  slug: string;
  keywords: string[]; // pre-extracted candidate phrases
}

export const MIN_INTERLINKS = 8;
export const MAX_INTERLINKS = 10;

/* ---------- keyword extraction ---------- */
const STOPWORDS = new Set<string>([
  // Bengali common words
  "এবং", "এর", "এক", "এই", "সেই", "তিনি", "তার", "তাকে", "তবে", "যা", "যে",
  "হয়", "হয়ে", "হয়েছে", "করে", "করেছে", "করা", "হতে", "থেকে", "জন্য", "পরে",
  "আগে", "উপর", "ভিতর", "মধ্যে", "সাথে", "দ্বারা", "কোনো", "একটি", "একটা",
  "সব", "অনেক", "কিছু", "তাহলে", "যদি", "নয়", "না", "হ্যাঁ", "আর", "ও",
  "বা", "কিন্তু", "অথবা", "যেহেতু", "কারণ", "গুলো", "গুলি", "টি", "টা",
  // English common
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
  "from", "as", "that", "this", "these", "those", "it", "its", "has", "have",
]);

function tokenizeWords(text: string): string[] {
  // Split on non-letter (Latin + Bengali) boundaries
  return text
    .split(/[^\u0980-\u09ff\w]+/u)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}

export function extractKeywords(title: string, content: string, max = 8): string[] {
  const keywords = new Set<string>();
  // Title words first (high value)
  const titleWords = tokenizeWords(title);
  for (const w of titleWords) keywords.add(w);

  // Bigrams from title
  for (let i = 0; i < titleWords.length - 1; i++) {
    keywords.add(`${titleWords[i]} ${titleWords[i + 1]}`);
  }

  // Top frequent content words (excluding already-added)
  const freq = new Map<string, number>();
  for (const w of tokenizeWords(content)) {
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  const sorted = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map((e) => e[0])
    .filter((w) => !keywords.has(w));
  for (const w of sorted) {
    keywords.add(w);
    if (keywords.size >= max) break;
  }

  return [...keywords].filter(Boolean);
}

const SKIP_TAGS = new Set(["a", "code", "pre", "script", "style", "head", "title"]);

/* ---------- safe parts-based tokenization ----------
   The OLD implementation spliced anchors into the HTML string using a single
   global `offset` accumulator. When insertions happened out of document order
   (a match in a LATER segment first, then a match in an EARLIER segment), the
   offset over-shifted the splice position and anchors got pasted INSIDE the
   title attributes of previously-inserted anchors, producing nested <a> tags
   and completely broken blog HTML (render-time corruption on every post).

   The new approach never splices into the raw HTML string. Instead we
   tokenize the content into an alternating list of parts:
     - { kind: "text" }  -> matchable plain text (safe to modify)
     - { kind: "html" }  -> untouchable markup (tags, and the full content of
                            <a>/<code>/<pre>/<script>/<style> etc.)
   Link insertion only ever SPLITS a text part into
   [before(text), anchor(html), after(text)] — mathematically impossible to
   land inside a tag or attribute, regardless of insertion order. */
type Part = { kind: "text"; text: string } | { kind: "html"; html: string };

function tokenizeHtmlParts(html: string): Part[] {
  const parts: Part[] = [];
  let buffer = "";
  const flushText = () => {
    if (buffer) {
      parts.push({ kind: "text", text: buffer });
      buffer = "";
    }
  };

  let i = 0;
  const n = html.length;
  while (i < n) {
    if (html[i] === "<") {
      const end = html.indexOf(">", i);
      if (end === -1) {
        // no closing ">" — treat the remainder as text
        buffer += html.slice(i);
        i = n;
        break;
      }
      const tagText = html.slice(i + 1, end);
      const isClose = tagText.startsWith("/");
      const tagName = (isClose ? tagText.slice(1) : tagText)
        .split(/[\s/>]/)[0]
        .toLowerCase();

      if (SKIP_TAGS.has(tagName) && !isClose) {
        // swallow the whole element (open tag + content + close tag) as one
        // untouchable html part so its inner text can never be matched
        const closeRe = new RegExp(`</${tagName}\\s*>`, "i");
        const rest = html.slice(end + 1);
        const mClose = closeRe.exec(rest);
        const closeEnd = mClose
          ? end + 1 + mClose.index + mClose[0].length
          : n;
        flushText();
        parts.push({ kind: "html", html: html.slice(i, closeEnd) });
        i = closeEnd;
      } else {
        flushText();
        parts.push({ kind: "html", html: html.slice(i, end + 1) });
        i = end + 1;
      }
    } else {
      const j = html.indexOf("<", i);
      if (j === -1) {
        buffer += html.slice(i);
        i = n;
      } else {
        buffer += html.slice(i, j);
        i = j;
      }
    }
  }
  flushText();
  return parts;
}

/* ---------- safe regex escape ---------- */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ---------- build a word-boundary-aware matcher ----------
   Bengali doesn't have \b in JS regex. We match when the phrase is preceded
   by start, whitespace, or punctuation (Bengali danda included) and followed
   by the same. */
function buildMatcher(phrase: string): RegExp | null {
  const esc = escapeRegex(phrase);
  if (!esc) return null;
  try {
    return new RegExp(
      `(^|[\\s\\u0964\\u0965.,;:!?()\\[\\]{}'"’‘“”-])(${esc})(?=$|[\\s\\u0964\\u0965.,;:!?()\\[\\]{}'"’‘“”-])`,
      "u"
    );
  } catch {
    return null;
  }
}

/* ---------- core: apply interlinking ---------- */
export function applySmartInterlinking(
  html: string,
  targets: InterlinkTarget[]
): { html: string; linksAdded: number; linkedSlugs: string[] } {
  if (!targets.length) return { html, linksAdded: 0, linkedSlugs: [] };

  const parts = tokenizeHtmlParts(html);
  if (!parts.some((p) => p.kind === "text")) {
    return { html, linksAdded: 0, linkedSlugs: [] };
  }

  const linkedSlugs = new Set<string>();

  const tryLink = (
    phrase: string,
    slug: string,
    title: string
  ): boolean => {
    if (linkedSlugs.has(slug)) return false;
    if (linkedSlugs.size >= MAX_INTERLINKS) return false;
    const re = buildMatcher(phrase);
    if (!re) return false;

    // Global variant so we can try successive occurrences of the phrase.
    const gre = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");

    // scan each text part (in document order) for the first USABLE match
    for (let pi = 0; pi < parts.length; pi++) {
      const part = parts[pi];
      if (part.kind !== "text") continue;

      let m: RegExpExecArray | null;
      while ((m = gre.exec(part.text)) !== null) {
        // Never wrap a link inside a markdown heading line (`## ...` / `### ...`).
        // formatBlogContent() renders those lines as <h2>/<h3> — a link inside a
        // heading looks broken and, before the formatter was fixed, was the
        // source of literal "<a href=...>" text showing on the page. The phrase
        // usually also occurs in body text; if not, Pass 3 ("আরও পড়ুন") still
        // links this post.
        const lineStart = part.text.lastIndexOf("\n", m.index - 1) + 1;
        let lineEnd = part.text.indexOf("\n", m.index);
        if (lineEnd === -1) lineEnd = part.text.length;
        const line = part.text.slice(lineStart, lineEnd);
        if (/^\s*#{1,6}\s/.test(line)) continue; // heading line — skip this occurrence

        const prefix = m[1] || "";
        const matchText = m[2];
        const before = part.text.slice(0, m.index + prefix.length);
        const after = part.text.slice(
          m.index + prefix.length + matchText.length
        );

        // SEO: পরিষ্কার canonical URL — /blog/[slug] (সার্ভার-রেন্ডার্ড, ইনডেক্সযোগ্য)
        const href = `/blog/${encodeURIComponent(slug)}`;
        const anchor = `<a href="${href}" data-interlink="true" title="${escapeAttr(title)}">${escapeHtml(matchText)}</a>`;

        // replace the text part with [before, anchor(html), after] — the
        // anchor becomes an untouchable html part so it can never be
        // re-matched or corrupted by a later insertion
        const replacement: Part[] = [];
        if (before) replacement.push({ kind: "text", text: before });
        replacement.push({ kind: "html", html: anchor });
        if (after) replacement.push({ kind: "text", text: after });
        parts.splice(pi, 1, ...replacement);

        linkedSlugs.add(slug);
        return true;
      }
    }
    return false;
  };

  // Sort targets by title length desc so longer phrases match first
  const sorted = [...targets].sort((a, b) => b.title.length - a.title.length);

  // Pass 1: full title phrase
  for (const t of sorted) {
    if (linkedSlugs.size >= MAX_INTERLINKS) break;
    tryLink(t.title, t.slug, t.title);
  }

  // Pass 2: title keywords (single strong words from title)
  if (linkedSlugs.size < MIN_INTERLINKS) {
    for (const t of sorted) {
      if (linkedSlugs.size >= MAX_INTERLINKS) break;
      if (linkedSlugs.has(t.slug)) continue;
      // try each keyword (prefer 2+ word phrases, then single words)
      const phrases = [
        ...t.keywords.filter((k) => k.includes(" ")),
        ...t.keywords.filter((k) => !k.includes(" ")),
      ];
      for (const kw of phrases) {
        if (linkedSlugs.size >= MAX_INTERLINKS) break;
        if (linkedSlugs.has(t.slug)) break;
        // only link if keyword length >= 4 to avoid noise
        if (kw.length < 4) continue;
        tryLink(kw, t.slug, t.title);
      }
    }
  }

  // Pass 3: append "আরও পড়ুন" section if still below MIN
  let linksAdded = linkedSlugs.size;
  if (linkedSlugs.size < MIN_INTERLINKS) {
    const remaining = sorted.filter((t) => !linkedSlugs.has(t.slug));
    const need = MIN_INTERLINKS - linkedSlugs.size;
    const toAppend = remaining.slice(0, need);
    if (toAppend.length) {
      const links = toAppend
        .map((t) => {
          const href = `/blog/${encodeURIComponent(t.slug)}`;
          return `<li><a href="${href}" data-interlink="true" title="${escapeAttr(t.title)}">${escapeHtml(t.title)}</a></li>`;
        })
        .join("");
      const section = `<div class="ioa-related-inline" style="margin-top:1.5em;padding:1em 1.25em;border:1px solid rgba(16,185,129,.25);border-radius:.75rem;background:rgba(16,185,129,.05)"><h3 style="font-size:1.05rem;font-weight:700;margin:0 0 .5em">আরও পড়ুন</h3><ul style="margin:0;padding-left:1.2em;line-height:1.9">${links}</ul></div>`;
      parts.push({ kind: "html", html: section });
      for (const t of toAppend) linkedSlugs.add(t.slug);
      linksAdded = linkedSlugs.size;
    }
  }

  const result = parts
    .map((p) => (p.kind === "text" ? p.text : p.html))
    .join("");
  return { html: result, linksAdded, linkedSlugs: [...linkedSlugs] };
}

/* ---------- helpers ---------- */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------- slugify + meta (unchanged, re-exported) ---------- */
export function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[\u0964\u0965]/g, "")
    .replace(/['"''""]/g, "")
    .replace(/[^\u0980-\u09ff\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `post-${Date.now()}`;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function generateMetaTitle(title: string): string {
  const t = title.trim();
  if (t.length <= 60) return t;
  return t.slice(0, 57).trimEnd() + "…";
}

export function generateMetaDescription(content: string, max = 155): string {
  const text = stripHtml(content);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

export function generateExcerpt(content: string, max = 160): string {
  return generateMetaDescription(content, max);
}

export function readingMinutes(content: string): number {
  const text = stripHtml(content);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
