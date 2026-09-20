/**
 * blog-content-formatter.ts
 *
 * Bug this fixes:
 * The CSV bulk-import content is plain text written in a markdown-ish shape
 * (## heading, ### sub-heading, blank-line paragraphs, "আরবি: / বাংলা উচ্চারণ:
 * / বাংলা অর্থ:" dua blocks, quoted Qur'an/Hadith citations, and an
 * "## প্রায়শই জিজ্ঞাসিত প্রশ্ন (FAQ)" section) — but it was being stored/
 * rendered as-is via dangerouslySetInnerHTML. Since it isn't real HTML, the
 * browser prints it as one unbroken blob: literal "##" characters, no
 * headings, no paragraph spacing, no FAQ, no ayat cards.
 *
 * formatBlogContent() converts that raw text into clean, structured HTML:
 *   - "## X"  -> <h2>X</h2>
 *   - "### X" -> <h3>X</h3> (or a FAQ question, see below)
 *   - blank-line separated text -> <p> paragraphs
 *   - "সংক্ষেপে: ..." -> a highlighted TL;DR summary box
 *   - "আরবি: ... / বাংলা উচ্চারণ: ... / বাংলা অর্থ: ..." -> a dua card with
 *     large RTL Arabic, transliteration and translation rows
 *   - "...quoted text..." (সূরা X: Y) or (হাদিস গ্রন্থ) -> a Qur'an ayat card
 *     or a hadith citation card, pulled out of the paragraph flow
 *   - a "## ... (FAQ)" / "## ... প্রশ্ন" heading -> every following "### "
 *     block becomes an accordion item (native <details>/<summary>, no JS
 *     required) until the next "## " heading
 *
 * If the content already looks like real HTML (has block tags), it's
 * returned untouched so hand-written / already-good posts aren't disturbed.
 *
 * Safe to import from a client component (used at render time) or from a
 * server route (to store clean HTML at import time instead) — pure string
 * logic, no DOM APIs.
 */

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// applySmartInterlinking() (src/lib/interlinking.ts) splices real
// `<a href="..." data-interlink="true">phrase</a>` tags directly into the
// raw content string before it reaches us. Those must never be re-escaped or
// they'll show up as literal "<a href=...>" text instead of working links.
//
// We protect ALL anchors at the TOP of formatBlogContent(), before any block
// splitting or regex matching. This is the only safe place to do it:
//   - protectAnchors per-block/per-inline is TOO LATE for `## heading` / `###
//     FAQ` / `আরবি:` lines, which escape their text with plain escapeHtml() —
//     anchors there were rendered as literal raw HTML text on the page.
//   - the citation regex below matches `"..."` quotes in the raw text and
//     could NOT tell the anchor's own attribute quotes (href="...",
//     title="...") from real content quotes — it split anchors mid-tag, both
//     halves failed the protection regex and got escaped (more visible raw
//     `<a href="/?view=blog-post&slug=...">` text).
// With top-level protection, anchors are replaced by \u0000A<n>\u0000
// placeholders that survive every intermediate transform (escapeHtml, **bold**
// conversion, citation matching, block splitting) and are restored verbatim at
// the single exit point.
const ANCHOR_RE = /<a\s+[^>]*>[\s\S]*?<\/a>/gi;
function protectAnchors(s: string): { text: string; anchors: string[] } {
  const anchors: string[] = [];
  const text = s.replace(ANCHOR_RE, (m) => {
    anchors.push(m);
    return `\u0000A${anchors.length - 1}\u0000`;
  });
  return { text, anchors };
}
function restoreAnchors(s: string, anchors: string[]): string {
  return s.replace(/\u0000A(\d+)\u0000/g, (_, idx) => anchors[Number(idx)] ?? "");
}

// Bold (**text**) + line breaks within a paragraph, applied after escaping.
// Interlink anchors are already placeholders by the time this runs (see
// protectAnchors above) — the placeholder survives escaping untouched and is
// restored once at the very end of formatBlogContent().
const inline = (s: string) =>
  escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");

const isQuranRef = (ref: string) => /^সূরা/.test(ref.trim());

/** Split a paragraph into plain-text parts and pulled-out citation cards. */
function renderParagraph(text: string): string {
  const citationRe = /["“]([^"”]{8,400}?)["”]\s*\(([^)]{2,80})\)\.?/g;
  let last = 0;
  let match: RegExpExecArray | null;
  const out: string[] = [];

  while ((match = citationRe.exec(text))) {
    const before = text.slice(last, match.index).trim();
    if (before) out.push(`<p>${inline(before)}</p>`);

    const quote = match[1].trim();
    const ref = match[2].trim();
    const quran = isQuranRef(ref);
    out.push(
      `<div class="citation-card ${quran ? "citation-quran" : "citation-hadith"}">` +
        `<p class="citation-text">${inline(quote)}</p>` +
        `<span class="citation-ref">${quran ? "কুরআন" : "হাদিস"} • ${escapeHtml(ref)}</span>` +
        `</div>`
    );
    last = citationRe.lastIndex;
  }

  const after = text.slice(last).trim();
  if (after) out.push(`<p>${inline(after)}</p>`);
  if (out.length === 0) out.push(`<p>${inline(text)}</p>`);
  return out.join("");
}

export function formatBlogContent(raw: string): string {
  if (!raw) return "";
  let trimmed = raw.trim();

  // applySmartInterlinking() may append a ready-made "আরও পড়ুন" HTML block
  // at the very end (see interlinking.ts, Pass 3). Pull it out so it isn't
  // treated as plain text and HTML-escaped; we reattach it untouched at the
  // end regardless of which branch below runs.
  let trailingHtml = "";
  const trailingMatch = trimmed.match(/(<div class="ioa-related-inline"[\s\S]*<\/div>)\s*$/);
  if (trailingMatch) {
    trailingHtml = trailingMatch[1];
    trimmed = trimmed.slice(0, trailingMatch.index).trim();
  }

  // Already real HTML (hand-authored / single-publish form) -> leave as-is.
  // Anchored to the START only — interlinking can splice a stray <a> or the
  // trailing block above into otherwise-plain CSV content, and testing
  // "anywhere in the string" would wrongly treat that whole plain-text
  // article as already-formatted and skip the transform below.
  if (/^<\s*(p|h[1-6]|div|ul|ol|blockquote|section|figure)[\s>]/i.test(trimmed)) {
    return trimmed + trailingHtml;
  }

  // Plain (CSV-imported markdown-ish) text: protect every interlink anchor
  // across the WHOLE document before any further processing — see the comment
  // on protectAnchors above for why this must happen here and only here.
  const { text: protectedText, anchors } = protectAnchors(trimmed);

  const blocks = protectedText
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  let html = "";
  let inFaqSection = false;
  let faqListOpen = false;
  let i = 0;

  const closeFaqList = () => {
    if (faqListOpen) {
      html += "</div>";
      faqListOpen = false;
    }
  };

  while (i < blocks.length) {
    const block = blocks[i];
    const h2Match = block.match(/^##\s+(.+)$/);
    const h3Match = block.match(/^###\s+(.+)$/);

    // ## Heading
    if (h2Match) {
      closeFaqList();
      const text = h2Match[1].trim();
      inFaqSection = /প্রশ্ন|FAQ/i.test(text);
      html += `<h2>${escapeHtml(text)}</h2>`;
      i++;
      continue;
    }

    // ### Heading inside a FAQ section -> accordion question + answer
    if (h3Match && inFaqSection) {
      const question = h3Match[1].trim();
      let j = i + 1;
      const answerParts: string[] = [];
      while (j < blocks.length && !/^#{2,3}\s+/.test(blocks[j])) {
        answerParts.push(renderParagraph(blocks[j]));
        j++;
      }
      if (!faqListOpen) {
        html += `<div class="faq-list">`;
        faqListOpen = true;
      }
      html +=
        `<details class="faq-item"><summary>${escapeHtml(question)}</summary>` +
        `<div class="faq-answer">${answerParts.join("")}</div></details>`;
      i = j;
      continue;
    }

    // ### Heading (regular sub-heading)
    if (h3Match) {
      closeFaqList();
      html += `<h3>${escapeHtml(h3Match[1].trim())}</h3>`;
      i++;
      continue;
    }

    // আরবি: ... / বাংলা উচ্চারণ: ... / বাংলা অর্থ: ...  -> dua card
    if (/^আরবি[:：]/.test(block)) {
      closeFaqList();
      const arabic = block.replace(/^আরবি[:：]\s*/, "").trim();
      let j = i + 1;
      let transliteration = "";
      let meaning = "";
      if (j < blocks.length && /^বাংলা উচ্চারণ[:：]/.test(blocks[j])) {
        transliteration = blocks[j].replace(/^বাংলা উচ্চারণ[:：]\s*/, "").trim();
        j++;
      }
      if (j < blocks.length && /^বাংলা অর্থ[:：]/.test(blocks[j])) {
        meaning = blocks[j].replace(/^বাংলা অর্থ[:：]\s*/, "").trim();
        j++;
      }
      html +=
        `<div class="dua-card">` +
        `<div class="dua-card-arabic font-arabic" dir="rtl" lang="ar">${escapeHtml(arabic)}</div>` +
        (transliteration
          ? `<div class="dua-card-row"><span class="dua-card-label">উচ্চারণ</span><p>${inline(transliteration)}</p></div>`
          : "") +
        (meaning
          ? `<div class="dua-card-row"><span class="dua-card-label">অর্থ</span><p>${inline(meaning)}</p></div>`
          : "") +
        `</div>`;
      i = j;
      continue;
    }

    // সংক্ষেপে: ... -> TL;DR summary box
    if (/^সংক্ষেপে[:：]/.test(block)) {
      closeFaqList();
      const text = block.replace(/^সংক্ষেপে[:：]\s*/, "").trim();
      html += `<div class="summary-box"><span class="summary-box-label">সংক্ষেপে</span><p>${inline(text)}</p></div>`;
      i++;
      continue;
    }

    // Regular paragraph (may still contain an inline Qur'an/Hadith quote)
    closeFaqList();
    html += renderParagraph(block);
    i++;
  }

  closeFaqList();
  return restoreAnchors(html, anchors) + trailingHtml;
}
