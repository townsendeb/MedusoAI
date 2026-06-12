import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getHostname,
  isAppHost,
  isMarketingHost,
  isMarketingRoute,
} from "@/lib/marketing/hosts";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];
const PUBLIC_PREFIXES = ["/api/inngest", "/auth/signout", "/auth/callback"];

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.medusoai.com";
const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL ?? "https://medusoai.com";

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isPublicPrefix(pathname: string) {
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isAppOnlyRoute(pathname: string) {
  return (
    isAuthRoute(pathname) ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/conversations") ||
    pathname.startsWith("/alerts") ||
    pathname.startsWith("/analytics")
  );
}

function redirectToApp(request: NextRequest, pathname: string) {
  const url = new URL(pathname + request.nextUrl.search, APP_URL);
  return NextResponse.redirect(url);
}

function redirectToMarketing(request: NextRequest, pathname: string) {
  const url = new URL(pathname + request.nextUrl.search, MARKETING_URL);
  return NextResponse.redirect(url);
}

/** Marketing site = root domain or localhost, not the app subdomain. */
function isMarketingSite(hostname: string): boolean {
  return !isAppHost(hostname) && (hostname === "localhost" || isMarketingHost(hostname));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const hostname = getHostname(request.headers.get("host"));
  const onMarketingSite = isMarketingSite(hostname);
  const onAppSubdomain = isAppHost(hostname);

  if (isPublicPrefix(pathname)) {
    return supabaseResponse;
  }

  // Production marketing domain: only /, /privacy, /terms — always public.
  if (onMarketingSite && hostname !== "localhost") {
    if (isAppOnlyRoute(pathname) || !isMarketingRoute(pathname)) {
      return redirectToApp(request, pathname);
    }
    return supabaseResponse;
  }

  // Localhost + production app subdomain: marketing pages are public even when logged in.
  if (isMarketingRoute(pathname)) {
    if (onAppSubdomain) {
      return redirectToMarketing(request, pathname);
    }
    if (onMarketingSite) {
      return supabaseResponse;
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (onAppSubdomain && pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const hasProfile = profile !== null;

  if (!hasProfile) {
    if (
      !pathname.startsWith("/onboarding") &&
      !isAuthRoute(pathname) &&
      !isMarketingRoute(pathname)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (isAuthRoute(pathname) || pathname.startsWith("/onboarding")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // App home only — marketing `/` stays on the landing page.
  if (onAppSubdomain && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
