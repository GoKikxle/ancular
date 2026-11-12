import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { confirmEmailHref, isEmailVerified, safeNextPath } from "@/lib/auth";

/** Pages anyone can open. Invite pages handle signed-out visitors themselves. */
const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/confirm-email",
  "/auth",
  "/privacy",
  "/pricing",
  "/waitlist",
  "/e/",
  "/api/",
];
/** Metadata / brand image routes (no session; crawlers and link previews hit these). */
const PUBLIC_BRAND_IMAGES = ["/opengraph-image", "/twitter-image", "/icon", "/apple-icon", "/favicon.ico"];
const AUTH_PAGES = ["/login", "/signup"];
/** Signed-in but unconfirmed users may stay on these without being bounced to confirm-email. */
const UNVERIFIED_OK = ["/confirm-email", "/login", "/signup", "/auth", "/privacy", "/pricing", "/waitlist", "/e/"];

function isPublic(pathname: string) {
  if (pathname === "/") return true;
  if (PUBLIC_BRAND_IMAGES.some((p) => pathname === p || pathname.startsWith(`${p}.`))) return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p.replace(/\/$/, "") || pathname.startsWith(p));
}

function allowsUnverified(pathname: string) {
  if (pathname === "/") return true;
  return UNVERIFIED_OK.some((p) => pathname === p || pathname.startsWith(p));
}

function redirectWithCookies(url: URL, response: NextResponse) {
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value));
  return redirect;
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (
    process.env.NODE_ENV === "development" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    // Local preview, or not configured yet: don't force the login pages.
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    }
  );

  // getUser validates the JWT and exposes email_confirmed_at (claims alone do not).
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const signedIn = !!user;
  const verified = isEmailVerified(user);
  const { pathname, search } = request.nextUrl;
  const here = `${pathname}${search}`;

  if (!signedIn && !isPublic(pathname)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", here);
    return redirectWithCookies(url, response);
  }

  if (signedIn && !verified && !allowsUnverified(pathname) && !pathname.startsWith("/api/")) {
    return redirectWithCookies(new URL(confirmEmailHref(here), request.url), response);
  }

  if (signedIn && verified && AUTH_PAGES.includes(pathname)) {
    const next = request.nextUrl.searchParams.get("next");
    const target = safeNextPath(next);
    return redirectWithCookies(new URL(target, request.url), response);
  }

  // Unverified users who land on login/signup: send them to confirm instead of the app.
  if (signedIn && !verified && AUTH_PAGES.includes(pathname)) {
    const next = request.nextUrl.searchParams.get("next");
    return redirectWithCookies(new URL(confirmEmailHref(next), request.url), response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|opengraph-image|twitter-image|apple-icon|icon|models/|tfjs/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
