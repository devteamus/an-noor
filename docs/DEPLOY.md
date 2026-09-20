# আন-নূর — Docker Compose (অ্যাপ + PostgreSQL) দিয়ে Coolify-তে ডিপ্লয় গাইড

এই রিপোতে সবকিছু **একটাই Docker Compose স্ট্যাকে** বান্ডল করা:

- **app** — আন-নূর Next.js অ্যাপ (নিজেই বিল্ড হয়, `Dockerfile` থেকে)
- **db** — PostgreSQL 16 (নিজেই চলে, ডেটা `pgdata` ভলিউমে সেভ থাকে)

Coolify-তে এটা **একটাই রিসোর্স** হিসেবে ডিপ্লয় হবে — আলাদা করে ডেটাবেস
বানানো, কানেক্ট করা, মাইগ্রেশন চালানো **কিচ্ছু লাগবে না**। কনটেইনার প্রথমবার
চালু হওয়ার সময় নিজেই:

1. PostgreSQL ready হওয়া পর্যন্ত অপেক্ষা করে
2. টেবিল তৈরি করে (`prisma db push`)
3. ২২টি ব্লগ পোস্ট + ৪টি বই + ক্যাটাগরি seed করে (খালি ডেটাবেস হলে)
4. `admin` অ্যাকাউন্ট বানায় (আপনার দেওয়া env তথ্য দিয়ে)
5. সার্ভার চালু করে

পরে রিডিপ্লয় করলে ডেটা হারায় না — আপনি অ্যাডমিন প্যানেলে যা এডিট করেছেন
তা অক্ষত থাকে (seed শুধু খালি ডেটাবেসে চলে)।

---

## ধাপ ০: যা যা লাগবে

- একটা **Coolify** সার্ভার (VPS-এ coolify.io থেকে ইনস্টল করা)
- **GitHub** অ্যাকাউন্ট (রিপো আপলোডের জন্য)
- একটা ডোমেইন (পরে পয়েন্ট করাবেন, যেমন `annoor.xyz`)

---

## ধাপ ১: সিক্রেট ভ্যালু বানানো (কম্পিউটারে ১ মিনিট)

আগে এই দুটো জিনিস বানিয়ে রাখুন — কাগজে/নোটপ্যাডে সেভ করুন:

**ক) PostgreSQL পাসওয়ার্ড** — লম্বা ও শক্তিশালী (২০+ অক্ষর)।
⚠ স্পেস, `@`, `:`, `/`, `#` ব্যবহার করবেন না; ইংরেজি অক্ষর+সংখ্যা+`! % * - _ .` ঠিক আছে।
উদাহরণ: `K7mR9xV2qL5wE8nB3zT6`

**খ) AUTH_SECRET** — আপনার কম্পিউটারে Node.js থাকলে এই কমান্ড চালান:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```
Node না থাকলে যেকোনো অনলাইন র‍্যান্ডম-স্ট্রিং জেনারেটরে ৪০+ অক্ষরের
র‍্যান্ডম স্ট্রিং বানান।

> ⚠ **গুরুত্বপূর্ণ:** `POSTGRES_PASSWORD` প্রথম ডিপ্লয়ের **আগেই** ঠিক করে নিন।
> PostgreSQL পাসওয়ার্ড শুধু প্রথমবার (খালি ভলিউমে) সেট হয় — পরে বদলাতে
> চাইলে ভলিউম রিসেট (সব ডেটা মুছে যাওয়া) বা ম্যানুয়াল SQL লাগে।

---

## ধাপ ২: GitHub-এ রিপো আপলোড

1. GitHub-এ নতুন **private** রিপো বানান (নাম: `annoor`)
2. এই ZIP-এর সব ফাইল রিপোতে আপলোড করুন (zip খুলে ভেতরের ফাইলগুলো রুটে):

**ভার্সন A — ওয়েবসাইট থেকে (সহজ):** রিপো পেজে **Add file → Upload files** →
সব ফাইল ড্র্যাগ করুন → **Commit changes**।

**ভার্সন B — টার্মিনাল থেকে:**
```bash
cd annoor                # zip খোলা ফোল্ডার
git init
git add .
git commit -m "Annoor production"
git remote add origin https://github.com/আপনার-ইউজারনেম/annoor.git
git branch -M main
git push -u origin main
```

> `.env` ফাইল `.gitignore`-এ বাদ দেওয়া — ভয় নেই, সিক্রেট GitHub-এ যাবে না।

---

## ধাপ ৩: Coolify-তে ডিপ্লয় (এক রিসোর্স)

### পথ A (রেকমেন্ডেড): GitHub রিপো থেকে

1. Coolify ড্যাশবোর্ড → **Resources → + New → Application**
2. GitHub সোর্স সিলেক্ট করুন (প্রথমবার লাগলে GitHub কানেক্ট/ডিপ্লয়-কী অনুমতি দিন) → `annoor` রিপো বেছে নিন
3. Coolify রিপোতে `docker-compose.yml` দেখে **Docker Compose** বিল্ড-প্যাক অফার করবে — সেটাই **সিলেক্ট করুন**
4. **সার্ভিস চিহ্নিত করুন:** `app` → Application, `db` → Database (Coolify নিজেই প্রস্তাব দেবে — রাখুন)
5. এখনো Deploy চাপবেন না — আগে Environment সেট করুন (নিচের ধাপ ৪)
6. ডোমেইন: `app` সার্ভিসে **Domains** সেকশনে আপনার ডোমেইন দিন
   (আপাতত না থাকলে Coolify-র ফ্রি `*.coolify.app` URL দিয়ে টেস্ট করুন)
7. **Deploy** চাপুন — প্রথম বিল্ড ৩–৮ মিনিট লাগবে (Docker ইমেজ তৈরি হবে)

### পথ B: Compose ফাইল পেস্ট করে (রিপো কানেক্ট না করে)

1. **Resources → + New → Docker Compose** (খালি/Empty)
2. `docker-compose.yml`-এর কনটেন্ট পেস্ট করুন, তবে `app` সার্ভিসের `build:` অংশ বদলে দিন:
   ```yaml
   build:
     context: https://github.com/আপনার-ইউজারনেম/annoor.git
   ```
3. বাকি ধাপ (env, domain, deploy) একই।

---

## ধাপ ৪: Environment ভ্যারিয়েবল সেট করা (সবচেয়ে গুরুত্বপূর্ণ)

রিসোর্সের **Environment / Environment Variables** ট্যাবে এগুলো যোগ করুন:

| ভ্যারিয়েবল | ভ্যালু |
|---|---|
| `POSTGRES_PASSWORD` | ধাপ ১-এ বানানো ডেটাবেস পাসওয়ার্ড |
| `AUTH_SECRET` | ধাপ ১-এ বানানো র‍্যান্ডম স্ট্রিং |
| `ADMIN_EMAIL` | আপনার অ্যাডমিন লগইন ইমেইল (যেমন `admin@imanoamal.com`) |
| `ADMIN_PASSWORD` | অ্যাডমিন লগইন পাসওয়ার্ড (শক্তিশালী) |
| `NEXT_PUBLIC_SITE_URL` | `https://annoor.xyz` (ডোমেইন ঠিক করার পর) |

> `POSTGRES_USER`, `POSTGRES_DB`, `DATABASE_URL` ইত্যাদি compose নিজেই
> ঠিক রাখে — বদলাতে হবে না। ভ্যালু না দিলে `POSTGRES_PASSWORD`-এর
> কারণে অ্যাপ শুরুতেই স্পষ্ট এরর দেখিয়ে থেমে যাবে — সেটা safety ফিচার।

Environment সেভ করে **Redeploy/Deploy** করুন।

---

## ধাপ ৫: চালু হলো কি না যাচাই

রিসোর্সের **Logs**-এ এই লাইনগুলো দেখলেই বুঝবেন সব ঠিক:

```
✓ ডেটাবেস স্কিমা সিঙ্ক হয়েছে
✓ ব্লগ পোস্ট: 22 টি  (প্রথমবার)
✓ admin তৈরি হয়েছে: admin@imanoamal.com
🚀 আন-নূর সার্ভার চালু: http://0.0.0.0:3000
```

তারপর ব্রাউজারে (Coolify-র দেওয়া URL বা আপনার ডোমেইনে):

- `/` — হোমপেজ আসছে?
- `/blog` — ব্লগ লিস্ট + ২২টি পোস্ট?
- যেকোনো একটা পোস্টে ক্লিক — কনটেন্ট + ইন্টারলিংক?
- `/api/health` — `{"ok":true,"db":true,...}` দেখাচ্ছে? (অ্যাপ+DB দুটোই সুস্থ)
- হেডারে **অ্যাডমিন** → আপনার `ADMIN_EMAIL/PASSWORD` দিয়ে লগইন

---

## ধাপ ৬: ডোমেইন পয়েন্ট করা

1. ডোমেইন প্রোভাইডারের DNS-এ **A রেকর্ড** যোগ করুন:
   - Host: `@` (এবং চাইলে `www` → CNAME `annoor.xyz`)
   - Value: Coolify সার্ভারের **Public IP**
2. Coolify-তে `app` সার্ভিসের **Domains**-এ `https://annoor.xyz` দিন → সেভ
   (Coolify নিজেই Let's Encrypt SSL বানিয়ে দেবে)
3. DNS ছড়াতে ৫–৩০ মিনিট লাগতে পারে
4. ডোমেইন লাইভ হলে `NEXT_PUBLIC_SITE_URL` ঠিক করে একবার **Redeploy** দিন —
   canonical/OG/sitemap URL-গুলো ডোমেইন ধরে আপডেট হবে

---

## ধাপ ৭: Google Search Console (এরর-মুক্ত সেটআপ)

1. [search.google.com/search-console](https://search.google.com/search-console) →
   **Add property → URL prefix** → `https://annoor.xyz`
2. যাচাই: DNS TXT রেকর্ড পদ্ধতি (ডোমেইন প্রোভাইডারের DNS-এ Coolify-র মতোই)
3. **Sitemaps → Add a new sitemap** → শুধু লিখুন: `sitemap.xml`
4. রোবট ফাইল ঠিক আছে কি না যাচাই:
   `https://annoor.xyz/robots.txt` খুলে দেখুন — শেষ লাইনে
   `Sitemap: https://annoor.xyz/sitemap.xml` থাকবে

**কেন এরর আসবে না:** সাইটম্যাপে শুধু ক্লিন canonical URL (`/blog/[slug]` ইত্যাদি)
আছে; robots.txt-ও ঠিক সেগুলোই allow করে; `/api/*` ও `?view=` URL সাইটম্যাপে
নেই ও robots-এ ব্লকড — তাই "Submitted URL blocked" / duplicate টাইপের কোনো
এরর আসার সুযোগ নেই। পুরনো লিংক থাকলে 308 (স্থায়ী) রিডাইরেক্ট করে।

---

## নিয়মিত ব্যবহার

### আপডেট দেওয়া (নতুন কোড/ফিচার)
```bash
git add . && git commit -m "update" && git push
```
Coolify-তে **Redeploy** (git push ধরলে অনেক সময় নিজেই শুরু করে)।
ভলিউমের ডেটা (ব্লগ/বই/ভিউ/অ্যাডমিন এডিট) অক্ষত থাকে।

### ব্যাকআপ (সপ্তাহে একবার করুন)
Coolify-র সার্ভারে টার্মিনাল (বা SSH) থেকে:
```bash
docker exec $(docker ps -qf name=db) \
  pg_dump -U annoor annoora > annoor-backup-$(date +%F).sql
```
রিস্টোর:
```bash
cat annoor-backup-YYYY-MM-DD.sql | \
  docker exec -i $(docker ps -qf name=db) psql -U annoor annoor
```

### ডেটা রিসেট (সব মুছে নতুন করে seed)
Coolify-তে `pgdata` ভলিউম ডিলিট করে Redeploy — প্রথম বুটের মতো আবার
২২ পোস্ট + ৪ বই seed হবে। অথবা shell থেকে:
`docker compose down -v` → `docker compose up -d --build`

---

## ট্রাবলশুটিং

| সমস্যা | কারণ ও সমাধান |
|---|---|
| অ্যাপ বারবার রিস্টার্ট হচ্ছে, log-এ `POSTGRES_PASSWORD... দুর্বল` | env-এ পাসওয়ার্ড সেট করেননি/ডিফল্ট রেখেছেন। ধাপ ৪ দেখুন |
| `P1001: Can't reach database server` | `db` সার্ভিস পরীক্ষা করুন: `docker compose logs db` |
| লগইন করা যাচ্ছে না (401) | `ADMIN_EMAIL/ADMIN_PASSWORD` env ঠিক আছে কি না দেখুন → env ঠিক করে Redeploy (অ্যাডমিন সিঙ্ক হয়ে যাবে) |
| ডোমেইন HTTPS হচ্ছে না | Coolify Domains-এ `https://` সহ ঠিক URL দেওয়া হয়েছে কি না দেখুন; DNS A রেকর্ড ঠিক আছে কি না যাচাই করুন |
| পাসওয়ার্ড বদলাতে চাই | ⚠ ডেটা রিসেট ছাড়া নয়, অথবা: `docker compose exec db psql -U annoor annoora -c "ALTER USER annoor PASSWORD 'নতুন';"` দিয়ে DB-তে বদলে env-ও একই দিন |
| প্রথম বিল্ড পরীক্ষায় ধরে আছে | ইমেজ ডাউনলোড+বিল্ড হচ্ছে — ৫–১০ মিনিট অপেক্ষা করুন (Build Logs দেখুন) |
| ভিউ কাউন্ট বাড়ছে না | বট ট্রাফিক কাউন্ট হয় না (সচেতন ডিজাইন); আসল ভিজিটরে বাড়বে |

---

## নিরাপত্তা সারসংক্ষেপ (এই স্ট্যাকে যা যা কনফিগার করা)

- PostgreSQL **বাইরের নেটওয়ার্কে নেই** — শুধু অ্যাপ কনটেইনার থেকে যোগ করা যায়
- অ্যাপ কনটেইনার **non-root ইউজারে** চলে; ডিফল্ট/দুর্বল পাসওয়ার্ডে চালুই হয় না
- অ্যাডমিন সেশন HMAC-সাইনড কুকি (httpOnly + secure), পাসওয়ার্ড scrypt হ্যাশ
- লগইনে rate limit (৫ বার ভুল হলে ১৫ মিনিট ব্লক), API-তে auth বাধ্যতামূলক
- কঠোর CSP + X-Frame-Options + HSTS হেডার; `/api/*` noindex+no-store
- সিক্রেট শুধু environment-এ — কোডে/GitHub-এ `.env` যায় না, ক্লায়েন্ট বান্ডেলে কিছুই ফাঁস হয় না
  (DevTools-এ যা-ই করুন, সার্ভার সাইড auth/DB দেখা/বদলানো যায় না)
