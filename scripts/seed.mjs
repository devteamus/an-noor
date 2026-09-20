// আন-নূর production seed — scripts/data/annoora-data.json থেকে সব ডেটা
// নতুন (খালি) ডেটাবেসে বসায় + env থেকে admin অ্যাকাউন্ট তৈরি/আপডেট করে।
//
// ব্যবহার (Docker/Postgres বা SQLite — DATABASE_URL env অনুযায়ী):
//   1. prisma db push        (টেবিল তৈরি)
//   2. node scripts/seed.mjs (এই স্ক্রিপ্ট)
//
// পুনরায় চালানো নিরাপদ (restart-safe):
//   - ডেটাবেসে ব্লগ থাকলে কনটেন্ট seed হয় না — অ্যাডমিন প্যানেলে করা এডিট
//     হারাবে না। জোর করে আবার seed করতে: node scripts/seed.mjs --force
//     (বা env SEED_FORCE=1)।
//   - admin অ্যাকাউন্ট env থেকে সবসময় সিঙ্ক হয় (ADMIN_EMAIL/ADMIN_PASSWORD)।
import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "crypto";
import { readFileSync } from "fs";

const db = new PrismaClient();

const FORCE =
  process.argv.includes("--force") || process.env.SEED_FORCE === "1";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}.${hash}`;
}

async function main() {
  /* --- restart-safe চেক: ডেটা থাকলে কনটেন্ট seed স্কিপ --- */
  const existingBlogs = await db.blog.count();
  if (existingBlogs > 0 && !FORCE) {
    console.log(
      `↷ ডেটাবেসে ইতোমধ্যে ${existingBlogs} টি ব্লগ আছে — কনটেন্ট seed স্কিপ ` +
        `(অ্যাডমিন এডিট সুরক্ষিত)। রিসেট করতে চাইলে: node scripts/seed.mjs --force`
    );
  } else {
    const raw = readFileSync(
      new URL("./data/annoora-data.json", import.meta.url),
      "utf8"
    );
    const data = JSON.parse(raw);

    /* --- categories --- */
    const catIdBySlug = new Map();
    for (const c of data.categories) {
      const cat = await db.blogCategory.upsert({
        where: { slug: c.slug },
        update: { name: c.name },
        create: { name: c.name, slug: c.slug },
      });
      catIdBySlug.set(c.slug, cat.id);
    }
    console.log(`✓ ক্যাটাগরি: ${data.categories.length} টি`);

    /* --- blogs --- */
    let blogs = 0;
    for (const b of data.blogs) {
      const categoryId = b.categorySlug ? catIdBySlug.get(b.categorySlug) : null;
      await db.blog.upsert({
        where: { slug: b.slug },
        update: {
          title: b.title,
          content: b.content,
          excerpt: b.excerpt,
          metaTitle: b.metaTitle,
          metaDescription: b.metaDescription,
          featureImage: b.featureImage,
          published: b.published,
          scheduledAt: b.scheduledAt,
          categoryId,
        },
        create: {
          title: b.title,
          slug: b.slug,
          content: b.content,
          excerpt: b.excerpt,
          metaTitle: b.metaTitle,
          metaDescription: b.metaDescription,
          featureImage: b.featureImage,
          published: b.published,
          scheduledAt: b.scheduledAt,
          views: b.views,
          categoryId,
        },
      });
      blogs++;
    }
    console.log(`✓ ব্লগ পোস্ট: ${blogs} টি`);

    /* --- shop products --- */
    let products = 0;
    for (const p of data.shopProducts) {
      const existing = await db.shopProduct.findFirst({
        where: { productId: p.productId },
      });
      if (existing) {
        await db.shopProduct.update({
          where: { id: existing.id },
          data: p,
        });
      } else {
        await db.shopProduct.create({ data: p });
      }
      products++;
    }
    console.log(`✓ শপ প্রোডাক্ট (বই): ${products} টি`);

    /* --- affiliate products (sidebar) --- */
    for (const p of data.affiliateProducts) {
      const existing = await db.affiliateProduct.findFirst({
        where: { url: p.url },
      });
      if (!existing) await db.affiliateProduct.create({ data: p });
    }
    console.log(`✓ অ্যাফিলিয়েট প্রোডাক্ট: ${data.affiliateProducts.length} টি`);

    /* --- affiliate settings (global, single row) --- */
    for (const s of data.affiliateSettings) {
      const existing = await db.affiliateSetting.findFirst();
      if (existing) {
        await db.affiliateSetting.update({ where: { id: existing.id }, data: s });
      } else {
        await db.affiliateSetting.create({ data: s });
      }
    }
    console.log(`✓ অ্যাফিলিয়েট সেটিংস: ${data.affiliateSettings.length} টি`);
  }

  /* --- admin (env থেকে; সবসময় সিঙ্ক) --- */
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (email && password) {
    const existing = await db.admin.findUnique({ where: { email } });
    if (existing) {
      await db.admin.update({
        where: { email },
        data: { password: hashPassword(password), name: "Admin" },
      });
      console.log(`✓ admin আপডেট হয়েছে: ${email}`);
    } else {
      await db.admin.create({
        data: { email, password: hashPassword(password), name: "Admin" },
      });
      console.log(`✓ admin তৈরি হয়েছে: ${email}`);
    }
  } else {
    console.log(
      "⚠ ADMIN_EMAIL / ADMIN_PASSWORD env সেট করা নেই — admin তৈরি হয়নি।\n" +
        "  (হোস্টিং প্যানেলে env সেট করে রিডিপ্লয় করুন — সেই তথ্যেই admin তৈরি হবে)"
    );
  }

  console.log("\nSeed সম্পন্ন ✅");
}

main()
  .catch((e) => {
    console.error("Seed ব্যর্থ:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
