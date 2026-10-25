"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

/*
  Cookie consent. Ancular only sets essential cookies today (the sign-in
  session), which don't need consent under UK GDPR/PECR or the EU rules, but
  people should be told. The choice is stored for any optional tools added later:
  check `hasConsent("analytics")` before loading one.

  The choice lives in localStorage, not a cookie, so asking doesn't set one.
*/

const KEY = "ancular-consent-v1";
const EVENT = "ancular-consent-change";
type Choice = { analytics: boolean; at: string };

function read(): Choice | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Choice) : null;
  } catch {
    return null;
  }
}

export function hasConsent(kind: "analytics") {
  return read()?.[kind] === true;
}

/** Re-open the banner, e.g. from a "Cookie settings" link. */
export function openCookieSettings() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function CookieConsent() {
  // Server and first paint render nothing, so the banner never flashes for people who already chose.
  const decided = useSyncExternalStore(subscribe, () => read() !== null, () => true);
  const [hidden, setHidden] = useState(false);
  if (decided || hidden) return null;

  function choose(analytics: boolean) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ analytics, at: new Date().toISOString() }));
    } catch {}
    setHidden(true);
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <div
      role="region"
      aria-label="Cookies"
      className="fixed inset-x-2 bottom-2 z-40 rounded-[6px] bg-page p-4 shadow-[0_0_0_1px_var(--hairline),0_8px_32px_rgba(0,0,0,0.12)] sm:inset-x-auto sm:left-4 sm:bottom-4 sm:max-w-sm"
      style={{ marginBottom: "var(--safe-bottom)" }}
    >
      <p className="t-item">Cookies</p>
      <p className="t-item-sub mt-1">
        We use essential cookies to keep you signed in. Nothing for ads, and no tracking across other sites.{" "}
        <Link href="/privacy#cookies" className="underline underline-offset-4 hover:text-ink">
          Details
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn btn-primary btn-sm flex-1" onClick={() => choose(true)}>
          Accept all
        </button>
        <button type="button" className="btn btn-quiet btn-sm flex-1" onClick={() => choose(false)}>
          Essential only
        </button>
      </div>
    </div>
  );
}

export function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      Cookie settings
    </button>
  );
}
