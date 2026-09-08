import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { COMING_SOON } from "./lib/brand";

const intlMiddleware = createMiddleware(routing);

// Legal pages stay reachable during the coming-soon gate — Impressumspflicht
// (§ 5 TMG) applies regardless of whether the site is "live" yet.
const ALWAYS_ALLOWED = ["/coming-soon", "/impressum", "/datenschutz"];

// The project still answers on the old elite-padel.de domain. Serving the
// same pages under two hostnames splits the brand and reads as duplicate
// content to search engines, so the old one permanently forwards to the
// canonical domain instead.
const CANONICAL_HOST = "rueckwand-padel.de";
const LEGACY_HOSTS = ["elite-padel.de", "www.elite-padel.de"];

export default function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase();
  if (host && LEGACY_HOSTS.includes(host)) {
    const target = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${CANONICAL_HOST}`);
    return NextResponse.redirect(target, 308);
  }

  if (COMING_SOON) {
    // These live outside the [locale] segment (no nav/footer chrome) — let
    // them through untouched. Everything else that would normally reach the
    // public site gets redirected to the gate.
    if (ALWAYS_ALLOWED.includes(request.nextUrl.pathname)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except:
  // - /api (API routes)
  // - /admin (admin area stays German only)
  // - /_next (Next internals)
  // - static files
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
