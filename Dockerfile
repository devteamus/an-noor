# syntax=docker/dockerfile:1
# আন-নূর (Annoor) — Next.js + Prisma(PostgreSQL) production image
# Multi-stage: deps (bun, lockfile-locked) → build → runner (node:22-alpine, শুধু দরকারি ফাইল)

# ---------- deps: ডিপেন্ডেন্সি ইনস্টল (bun.lock থেকে, deterministic) ----------
# alpine variant ব্যবহার করা হচ্ছে যাতে libc (musl) runner (node:22-alpine)-এর
# সাথে ম্যাচ করে — নাহলে prisma engine/sharp-এর মতো নেটিভ বাইনারি debian(glibc)-এ
# বিল্ড হয়ে alpine(musl) রানারে কাজ করবে না ("exec format"/"engine not found" এরর)
FROM oven/bun:1-alpine AS deps
WORKDIR /app
# prisma schema আগে কপি করতে হবে — bun install-এর postinstall হুক
# (package.json-এ "postinstall": "prisma generate") schema.prisma খুঁজবে;
# শুধু package.json+bun.lock কপি করলে "Could not find Prisma Schema" এরর দিয়ে
# পুরো বিল্ডই ফেইল করত
COPY package.json bun.lock ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile

# ---------- builder: prisma generate + next build ----------
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# বিল্ডে আসল DB লাগে না — ভ্যালিড-ফরম্যাট placeholder URL যথেষ্ট
ENV NEXT_TELEMETRY_DISABLED=1 \
    DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ARG NEXT_PUBLIC_SITE_URL=https://annoor.xyz
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN bun run build

# ---------- runner: হালকা প্রোডাকশন ইমেজ ----------
FROM node:22-alpine AS runner
# prisma (musl/openssl3) + node native মডিউলের জন্য
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Next.js standalone সার্ভার + স্ট্যাটিক/পাবলিক ফাইল
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma runtime + CLI — কনটেইনার চালু হওয়ার সময় db push + seed চালানোর জন্য
# (standalone node_modules-এর উপরে overlay — ভার্সন এক, কনফ্লিক্ট নেই)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin

# স্কিমা + seed ডেটা + entrypoint
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY docker-entrypoint.sh ./docker-entrypoint.sh

# non-root ইউজার হিসেবে চলবে (container security)
RUN chmod +x docker-entrypoint.sh \
  && addgroup -S annoor && adduser -S annoor -G annoor \
  && chown -R annoor:annoor /app
USER annoor

EXPOSE 3000

# /api/health অ্যাপ+DB দুটোই চেক করে (node:22-এ fetch built-in)
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
