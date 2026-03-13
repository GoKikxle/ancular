import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({
        error: "Missing env vars",
        hasUrl: Boolean(supabaseUrl),
        hasAnonKey: Boolean(anonKey),
      });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.from("trips").select("*");

    if (error) {
      return NextResponse.json({
        error: error.message,
        code: error.code ?? null,
        details: error.details ?? null,
      });
    }

    return NextResponse.json({
      ok: true,
      count: data?.length ?? 0,
      trips: data,
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}