# আন-নূর — SEO অডিট রিপোর্ট ও চেকলিস্ট

অডিট তারিখ: ২০২৬-০৯-২০ · যা পাওয়া গেল আর যা ফিক্স করা হলো — সব এখানে।

---

## ১) Technical SEO — পাওয়া সমস্যা ও ফিক্স

### ❌ সমস্যা ১: robots.txt ছিল না কার্যকর
আগে public/robots.txt সব URL সব bot-কে allow করত — `/api/`, admin ভিউ, SPA ভিউ সব crawl হতো।
**ফিক্স:** `src/app/robots.ts` — এখন শুধু ইনডেক্সযোগ্য URL allow (`/`, `/blog`, `/blog/[slug]`, `/books`, `/contact`, `/privacy`, `/terms`), `/api/` ও `?view=` ব্লক, সাথে sitemap reference।

### ❌ সমস্যা ২: Sitemap-এ SPA URL ছিল
`/?view=blog-post&slug=...` ধরনের URL সাইটম্যাপে ছিল — canonical নেই, duplicate কনটেন্টের ঝুঁকি।
**ফিক্স:** সাইটম্যাপে এখন ক্লিন URL (`/blog/[slug]`), প্রতিটির `lastmod` = কনটেন্ট আপডেটের তারিখ।

### ❌ সমস্যা ৩: ব্লগ কনটেন্ট ছিল client-side render
Google ক্লায়েন্ট-সাইড রেন্ডার করতে পারে, কিন্তু ধীর + ঝুঁকিপূর্ণ (AI crawler পারেই না)।
**ফিক্স:** প্রতিটি পোস্ট এখন `/blog/[slug]`-এ **সার্ভার-রেন্ডার্ড** — সাথে:
- ইউনিক `<title>`, meta description, canonical, OG (article), Twitter card
- JSON-LD: `BlogPosting` + `BreadcrumbList` + `FAQPage`
- পুরনো `?view=` URL → 308 permanent redirect → ক্লিন URL

### ❌ সমস্যা ৪: ভিউ-এর মধ্যে লিংক div/onClick ছিল
ব্লগ কার্ড click-যোগ্য div ছিল — bot ফলো করতে পারত না।
**ফিক্স:** সব internal লিংক এখন আসল `<a href>` (কার্ড, breadcrumb, category, pagination, related, interlink, footer)।

### ❌ সমস্যা ৫: OG image SVG ছিল
Facebook/WhatsApp SVG OG image সাপোর্ট করে না — শেয়ারে ছবি আসত না।
**ফিক্স:** `og-image.png` (1200×630) সঠিক size-এ তৈরি, সব পেজে যুক্ত।

### ⚠️ সমস্যা ৬: প্রতি ভিউতে updatedAt বদলাতো
প্রতিটি পেজ ভিজিটে sitemap lastmod বদলে যেত — Search Console-এ ফালতু "updated" সিগন্যাল।
**ফিক্স:** ভিউ-কাউন্ট আর lastmod নাড়ায় না; বট (Googlebot ইত্যাদি) ভিজিট ভিউ-কাউন্টে যোগ হয় না।

### ✅ যা আগেই ঠিক ছিল
- `metadataBase`, title template, description, keywords
- manifest.json, theme-color, viewport
- বাংলা `lang="bn"`, og:locale bn_BD
- H1 → H2 → H3 কাঠামো (কনটেন্ট ফরম্যাটার এমনিই বানায়)
- /privacy /terms /contact আসল URL-এ (চেক করা: সব 200 OK)

## ২) On-Page SEO — প্রতি পেজ

| পেজ | Title | Description | Canonical | OG | JSON-LD |
|---|---|---|---|---|---|
| `/` | ✅ ইউনিক | ✅ | ✅ | ✅ PNG | ✅ |
| `/blog` | ✅ | ✅ | ✅ (category-aware) | ✅ | ✅ Blog |
| `/blog/[slug]` (×২২) | ✅ metaTitle | ✅ metaDescription | ✅ | ✅ article | ✅ BlogPosting+FAQ+Breadcrumb |
| `/books` | ✅ | ✅ | ✅ | ✅ | ✅ ItemList+Product |
| `/privacy` `/terms` `/contact` | ✅ | ✅ | ✅ | ✅ | — |

**Interlinking:** প্রতিটি পোস্টে ৮-১০টি ক্লিন internal লিংক (automated) — crawl depth কম, link equity ভালো।

## ৩) AI Overview SEO (Google AI Overview / ChatGPT / Perplexity-তে cite হওয়া)

যা করা হয়েছে:
- **FAQPage JSON-LD** প্রতিটি পোস্টে (FAQ সেকশন থেকে অটো-এক্সট্রাক্ট) — AI Overview সরাসরি Q&A টেক্সট নেয়
- **BlogPosting schema** — তারিখ/লেখক/ভাষা স্পষ্ট
- সার্ভার-রেন্ডার্ড কনটেন্ট — AI crawler JS চালাতে পারে না, তাই এটা জরুরি
- `llms.txt` যোগ — সাইটের সারসংক্ষেপ + মূল URL তালিকা
- robots.txt-এ AI crawler allow: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot ইত্যাদি
- কনটেন্টে সূত্র (কুরআন/হাদিস citation card) — AI সূত্রযুক্ত কনটেন্ট prefer করে

## ৪) নিরাপত্তা অডিট — যা করা হলো

| ঝুঁকি | ফিক্স |
|---|---|
| Login brute-force | রেট-লিমিট: ৫ ব্যর্থ/১৫ মিনিট → 429 |
| Production-এ default admin123 তৈরি হওয়া | env ছাড়া production-এ admin তৈরি হয় না |
| CSP-তে unsafe-eval | production build-এ বাদ |
| API response index হওয়া | `/api/*` → `X-Robots-Tag: noindex` |
| Auth secret fallback | production-এ env না থাকলে console warning |
| DB ফাইল GitHub-এ যাওয়া | `.gitignore`-এ `/db/` + zip-এ DB নেই |
| Query log leak | production-এ Prisma query log বন্ধ |

**DevTools নিয়ে সত্য কথা:** ব্রাউজারের DevTools দিয়ে কেউ client-side JS দেখতে পারবে — এটা আটকানোর উপায় নেই, কিন্তু তাতে কিছুই ভাঙা যায় না কারণ: সব অ্যাডমিন অপারেশনে server-side session চেক, সিক্রেট env-এ (ব্রাউজারে পাঠানোই হয় না), পাসওয়ার্ড hash, API-তে rate limit। localStorage-এর আমল ডেটা ইউজারের নিজের — সেটা নিয়ে চিন্তার কিছু নেই।

## ৫) Off-Page SEO — ডিপ্লয়ের পরে আপনি যা করবেন (কোডে হয় না)

অফ-পেজ = আপনার সাইটের বাইরের সিগন্যাল। ধাপে ধাপে:

**সপ্তাহ ১:**
- [ ] Google Search Console-এ property + sitemap সাবমিট
- [ ] Bing Webmaster Tools (Google থেকে import)
- [ ] Facebook পেজ খুলুন → সাইট লিংক + ২-৩টা পোস্ট শেয়ার
- [ ] YouTube টাইটেল/ডেসক্রিপশনে সাইট লিংক

**সপ্তাহ ২-৪:**
- [ ] বাংলাদেশি ইসলামিক ফেসবুক গ্রুপে ভ্যালু-দেওয়া পোস্ট (স্প্যাম নয়!)
- [ ] ইসলামিক ফোরাম/কমিউনিটিতে সাহায্যমূলক উত্তরে লিংক
- [ ] প্রতিটি নতুন পোস্ট শেয়ার: Facebook, WhatsApp, X (Twitter)
- [ ] Google Business Profile (যদি ব্র্যান্ড হিসেবে দরকার মনে করেন)

**মাস ২-৩+:**
- [ ] একই বিষয়ের বাংলা ব্লগ/নিউজ সাইটে guest আর্টিকেল → লিংক
- [ ] অ্যাপ ডিরেক্টরি (Product Hunt, alternativeto ইত্যাদি)
- [ ] YouTube-এ দোয়া-সম্পর্কিত ভিডিও → ডেসক্রিপশনে সংশ্লিষ্ট পোস্টের লিংক
- [ ] নিয়মিত নতুন পোস্ট (সপ্তাহে ১-২টা) — freshness সিগন্যাল

**যা করবেন না:** লিংক কিনা, স্প্যাম কমেন্ট, স্ব-লিংক ফার্ম — Google penalty খায়।

## ৬) রেজাল্ট মাপার উপায়

- Search Console → Performance: কোন কোয়েরিতে আসছে, CTR, position
- Search Console → Pages: কোন URL ইনডেক্সড
- Vercel Analytics (ফ্রি) — ভিজিটর
- ২-৩ মাস ধৈর্য ধরুন — নতুন সাইটে র‍্যাংক হতে সময় লাগে

## ৭) ফিউচার সুপারিশ (পরে করলে ভালো)

- ব্লগ পোস্টে ফিচার ইমেজ যোগ করুন (admin থেকে) — image SEO + CTR বাড়ে
- `annoor.xyz/sitemap.xml` Search Console-এ মাসে একবার re-submit
- কমপিটিটর কোয়েরি খুঁজতে: Search Console-এ impression আছে কিন্তু position ১০-২০ — সেগুলোর কনটেন্ট আরও গভীর করুন
- Google Analytics 4 যোগ করতে চাইলে পরে বলুন — যোগ করে দেবো
