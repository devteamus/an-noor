#!/bin/sh
# আন-নূর container entrypoint —
#   ১) env যাচাই (নিরাপত্তা)
#   ২) PostgreSQL ready হওয়া পর্যন্ত অপেক্ষা
#   ৩) prisma db push (টেবিল তৈরি/সিঙ্ক — নতুন volume হলে তৈরি, পুরনো হলে নো-অপ)
#   ৪) seed (ডেটাবেস খালি হলে ব্লগ+বই+admin বসায়; ডেটা থাকলে স্কিপ)
#   ৫) Next.js standalone সার্ভার চালু
set -e

cd /app

# ---------- ১) নিরাপত্তা যাচাই ----------
PG_PASS="${POSTGRES_PASSWORD:-}"
if [ -z "$PG_PASS" ] || [ "$PG_PASS" = "change-me-strong-password" ] || \
   [ "$PG_PASS" = "postgres" ] || [ "$PG_PASS" = "password" ] || \
   [ "$PG_PASS" = "123456" ]; then
  echo "❌ [SECURITY] POSTGRES_PASSWORD সেট করা হয়নি বা খুব দুর্বল।"
  echo "   Coolify/Compose-এর Environment-এ শক্তিশালী পাসওয়ার্ড দিয়ে রিডিপ্লয় করুন।"
  echo "   (দেখুন .env.example)"
  exit 1
fi

if [ -z "$AUTH_SECRET" ] || [ "$AUTH_SECRET" = "change-me-to-a-long-random-string" ]; then
  echo "⚠ [SECURITY] AUTH_SECRET সেট করা হয়নি — অ্যাডমিন সেশন ডিফল্ট সিক্রেটে চলছে।"
  echo "   বানান: node -e \"console.log(require('crypto').randomBytes(32).toString('base64url'))\""
  echo "   Coolify/Compose-এর Environment-এ AUTH_SECRET হিসেবে বসান।"
fi

# ---------- DATABASE_URL (compose না দিলে নিজেই বানায়) ----------
if [ -z "${DATABASE_URL:-}" ]; then
  export DATABASE_URL="postgresql://${POSTGRES_USER:-annoor}:${PG_PASS}@${DB_HOST:-db}:5432/${POSTGRES_DB:-annoora}"
fi
export PORT="${PORT:-3000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"

echo "==> আন-নূর চালু হচ্ছে (port ${PORT})"

# ---------- ২+৩) DB ready + স্কিমা সিঙ্ক (সর্বোচ্চ ২ মিনিট রিট্রাই) ----------
PRISMA="node /app/node_modules/prisma/build/index.js"
n=0
until $PRISMA db push --schema /app/prisma/schema.prisma --skip-generate >/dev/null 2>&1; do
  n=$((n+1))
  if [ "$n" -ge 60 ]; then
    echo "❌ ২ মিনিট চেষ্টার পরেও PostgreSQL-এ যোগ হাওয়া যাচ্ছে না।"
    echo "   db সার্ভিসের লগ দেখুন: docker compose logs db"
    exit 1
  fi
  sleep 2
done
echo "✓ ডেটাবেস স্কিমা সিঙ্ক হয়েছে"

# ---------- ৪) seed (খালি DB হলে) ----------
node /app/scripts/seed.mjs

# ---------- ৫) সার্ভার ----------
echo "🚀 আন-নূর সার্ভার চালু: http://0.0.0.0:${PORT}"
exec node server.js
