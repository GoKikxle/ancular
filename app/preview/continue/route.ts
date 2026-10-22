import { NextResponse } from "next/server";
import { previewEnabled } from "@/lib/preview-events";
import {
  PREVIEW_GUEST_COOKIE,
  PREVIEW_GUEST_ID,
  previewGuestCookieOptions,
  safeInvitePath,
} from "@/lib/preview-guest";

/** Development only: remember a preview guest, then open their invite. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const invite = safeInvitePath(url.searchParams.get("next"));
  if (!previewEnabled() || !invite) {
    return NextResponse.redirect(new URL(previewEnabled() ? "/dashboard" : "/login", url));
  }

  const response = NextResponse.redirect(new URL(invite, url));
  response.cookies.set(PREVIEW_GUEST_COOKIE, PREVIEW_GUEST_ID, previewGuestCookieOptions());
  return response;
}
