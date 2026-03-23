import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";
    const base = origin.replace(/\/+$/, "");

    if (!code) {
      return NextResponse.redirect(`${base}/login?error=auth_callback_error`);
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] exchange failed", error);
      return NextResponse.redirect(`${base}/login?error=auth_callback_error`);
    }

    const redirectTo = next.startsWith("/") ? next : `/${next}`;
    return NextResponse.redirect(`${base}${redirectTo}`);
  } catch (err) {
    console.error("[auth/callback] unhandled error", err);
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ancular.vercel.app";
    return NextResponse.redirect(`${origin.replace(/\/+$/, "")}/login?error=auth_callback_error`);
  }
}
