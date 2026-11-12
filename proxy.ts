import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Pages anyone can open. Invite pages handle signed-out visitors themselves. */
const PUBLIC_PREFIXES = ["/login", "/signup", "/auth", "/privacy", "/pricing", "/waitlist", "/e/", "/api/"];
/** Metadata / brand image routes (no session; crawlers and link previews hit these). */
const PUBLIC_BRAND_IMAGES = ["/opengraph-image", "/twitter-image", "/icon", "/apple-icon", "/favicon.ico"];
const AUTH_PAGES = ["/login", "/signup"];

function isPublic(pathname: string) {
  if (pathname === "/") return true;
  if (PUBLIC_BRAND_IMAGES.some((p) => pathname === p || pathname.startsWith(`${p}.`))) return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p.replace(/\/$/, "") || pathname.startsWith(p));
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

  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims;
  const { pathname, search } = request.nextUrl;

  if (!signedIn && !isPublic(pathname)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return redirectWithCookies(url, response);
  }

  if (signedIn && AUTH_PAGES.includes(pathname)) {
    const next = request.nextUrl.searchParams.get("next");
    const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
    return redirectWithCookies(new URL(target, request.url), response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|opengraph-image|twitter-image|apple-icon|icon|models/|tfjs/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
