"use client";

import { useSyncExternalStore } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { hasConsent } from "@/components/consent/CookieConsent";

/*
  Page analytics only, and only after "Accept all".
  No custom events, no face/selfie data, no emails or user ids.
  Vercel Web Analytics + Speed Insights; essential-only visitors get neither.
*/

const EVENT = "ancular-consent-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function OptionalAnalytics() {
  const allowed = useSyncExternalStore(subscribe, () => hasConsent("analytics"), () => false);
  if (!allowed) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
