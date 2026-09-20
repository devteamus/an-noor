// Simple, dependency-free cookie auth using Node's built-in crypto.
// - Passwords hashed with scrypt
// - Session token = base64(payload).base64(hmac)
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const SESSION_COOKIE = "annoor_admin";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days (seconds)
const SECRET =
  process.env.AUTH_SECRET ||
  "iman-o-amal-dev-secret-change-in-production-please-32+";

// প্রোডাকশনে fallback secret ব্যবহার হলে স্পষ্ট সতর্কতা — session forge করা যেতে পারে
if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  console.warn(
    "[SECURITY] AUTH_SECRET env সেট করা হয়নি — অ্যাডমিন সেশন দুর্বল! Vercel-এ AUTH_SECRET যোগ করুন।"
  );
}

/* ---------- password hashing ---------- */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}.${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(".");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const testBuf = scryptSync(password, salt, 64);
  if (hashBuf.length !== testBuf.length) return false;
  return timingSafeEqual(hashBuf, testBuf);
}

/* ---------- session token ---------- */
function sign(payload: string): string {
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verify(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return payload;
}

export function createSessionToken(adminId: string, email: string): string {
  const payload = JSON.stringify({
    sub: adminId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL,
  });
  const b64 = Buffer.from(payload, "utf8").toString("base64url");
  return sign(b64);
}

export function verifySessionToken(token: string): {
  sub: string;
  email: string;
} | null {
  const b64 = verify(token);
  if (!b64) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

/* ---------- cookie helpers (server-side) ---------- */
export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getSession(): Promise<{
  sub: string;
  email: string;
} | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/* ---------- ensure a default admin exists ----------
   প্রোডাকশনে ডিফল্ট admin123 দিয়ে অ্যাডমিন তৈরি হয় না — ADMIN_EMAIL +
   ADMIN_PASSWORD env দিলে সেগুলো দিয়ে তৈরি হয়, নাহলে seed স্ক্রিপ্ট/ম্যানুয়াল
   তৈরি করতে হবে। dev-এ আগের মতোই ডিফল্ট ক্রেডেনশিয়াল কাজ করে। */
export async function ensureDefaultAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@imanoamal.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const envCredsProvided = Boolean(
    process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD
  );
  const existing = await db.admin.findUnique({ where: { email } });
  if (existing) return;
  if (process.env.NODE_ENV === "production" && !envCredsProvided) {
    // ডিফল্ট ক্রেডেনশিয়াল দিয়ে প্রোডাকশন অ্যাডমিন তৈরি নিষিদ্ধ
    return;
  }
  await db.admin.create({
    data: {
      email,
      password: hashPassword(password),
      name: "Admin",
    },
  });
}

export async function authenticateAdmin(email: string, password: string) {
  await ensureDefaultAdmin();
  const admin = await db.admin.findUnique({ where: { email } });
  if (!admin) return null;
  if (!verifyPassword(password, admin.password)) return null;
  return admin;
}
