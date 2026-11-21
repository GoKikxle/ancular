"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Counts a page view for the owner dashboard. No cookies, nothing stored on the
 * device, no identifiers: just the page and where the visitor came from.
 */
// document.referrer keeps the first page's referrer during in-app navigation, so only
// the first view of a page load can start a visit; later views count as internal.
let firstView = true;

export function VisitBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const r = firstView ? document.referrer : location.origin;
    firstView = false;
    const body = JSON.stringify({ p: pathname, r });
    try {
      if (!navigator.sendBeacon?.("/api/v", body)) {
        fetch("/api/v", { method: "POST", body, keepalive: true }).catch(() => {});
      }
    } catch {
      // ignore
    }
  }, [pathname]);
  return null;
}
