import { NextRequest, NextResponse } from "next/server";

// পুরনো SPA লিংক (?view=...) → স্থায়ী (308) রিডাইরেক্ট ক্লিন canonical URL-এ।
// Search Console-এ একটাই প্রতিটি কনটেন্টের একটাই URL থাকবে — duplicate/redirect এরর নেই।
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (pathname !== "/") return NextResponse.next();

  const view = searchParams.get("view");

  if (view === "blog-post") {
    const slug = searchParams.get("slug");
    if (slug) {
      const url = req.nextUrl.clone();
      url.pathname = `/blog/${encodeURIComponent(slug)}`;
      url.search = "";
      return NextResponse.redirect(url, 308);
    }
  }

  if (view === "blog") {
    const url = req.nextUrl.clone();
    url.pathname = "/blog";
    const params = new URLSearchParams();
    const page = searchParams.get("page");
    const category = searchParams.get("category");
    if (page && Number(page) > 1) params.set("page", page);
    if (category) params.set("category", category);
    url.search = params.toString() ? `?${params.toString()}` : "";
    return NextResponse.redirect(url, 308);
  }

  if (view === "shop") {
    const url = req.nextUrl.clone();
    url.pathname = "/books";
    url.search = "";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

// শুধু হোম পেজ ("/") রিকোয়েস্টে চলে — স্ট্যাটিক/অ্যাসেট/API/অন্য রুট স্পর্শ হয় না
export const config = {
  matcher: ["/"],
};
