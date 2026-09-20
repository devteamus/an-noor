# আন-নূর (Annoor) — ইসলামিক আমল ট্র্যাকার ও ব্লগ

বাংলা ইসলামিক ওয়েব অ্যাপ: দুআ কাউন্টার, ডিজিটাল তসবিহ, আল্লাহর ৯৯ নাম, রুকইয়াহ,
নামাজের নিয়ম ও সহিহ দোয়া-আমলের ব্লগ (২২টি আর্টিকেল + ৪টি বই সহ আসে)।

## ডিপ্লয়: Docker Compose (অ্যাপ + PostgreSQL একসাথে)

এই রিপো **একটাই Docker Compose স্ট্যাক** — Coolify/VPS-এ এক রিসোর্স হিসেবে
ডিপ্লয় হয়, আলাদা ডেটাবেস লাগে না:

```bash
cp .env.example .env    # ভ্যালু বসান (POSTGRES_PASSWORD, ADMIN_*, AUTH_SECRET)
docker compose up -d --build
# প্রথমবার: টেবিল তৈরি + ২২ ব্লগ + ৪ বই seed + admin তৈরি → সার্ভার চালু
```

Coolify-তে ডিপ্লয়ের সম্পূর্ণ ধাপে ধাপে গাইড: **docs/DEPLOY.md**

## দ্রুত শুরু (ডেভেলপার, Docker ছাড়া)

```bash
bun install                 # বা npm install
cp .env.example .env        # DATABASE_URL আপনার ডেটাবেসে সেট করুন
bunx prisma generate
bunx prisma db push
node scripts/seed.mjs
bun run dev
```

## টেস্ট

```bash
curl http://localhost:3000/api/health
# {"ok":true,"db":true,...} — অ্যাপ + ডেটাবেস দুটোই সুস্থ
```

## SEO

- Server-rendered ব্লগ (`/blog`, `/blog/[slug]`), JSON-LD (BlogPosting, FAQ, Breadcrumb, Product)
- `robots.txt` — শুধু গুরুত্বপূর্ণ URL allow, `/api/*` ও SPA ভিউ ব্লক, AI crawler allow
- `sitemap.xml` — সব লাইভ পোস্টসহ ডায়নামিক; অডিট রিপোর্ট: **docs/SEO-AUDIT.md**

## টেক স্ট্যাক

Next.js 16 (App Router, standalone) · React 19 · Tailwind CSS 4 · Prisma + PostgreSQL 16 ·
Zustand · framer-motion · Docker (multi-stage, node:22-alpine)
