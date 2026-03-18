import { createClient } from "@/lib/supabase/server";
import { getURL } from "@/lib/url";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const baseUrl = getURL().replace(/\/+$/, "");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectTo = next.startsWith("/") ? next : `/${next}`;
      return NextResponse.redirect(`${baseUrl}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_error`);
}
