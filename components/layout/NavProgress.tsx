"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * A thin bar along the top from the moment someone taps a link until the next page
 * is on screen, so a tap never looks ignored.
 */
export function NavProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [loading, setLoading] = useState(false);

  // The new page is showing: hide the bar.
  useEffect(() => {
    const done = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(done);
  }, [pathname, search]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (url.pathname.startsWith("/api/")) return;
      setLoading(true);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Never leave it stuck if a navigation is abandoned.
  useEffect(() => {
    if (!loading) return;
    const stop = setTimeout(() => setLoading(false), 15000);
    return () => clearTimeout(stop);
  }, [loading]);

  return loading ? <div className="nav-progress" role="progressbar" aria-label="Loading" /> : null;
}
