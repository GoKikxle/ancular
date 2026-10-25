"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/*
  Cookie consent. Ancular only sets essential cookies today (the sign-in
  session), which don't need consent under UK GDPR/PECR or the EU rules, but
  people should be told. Until a choice is made (either works), the page can be
  read and scrolled but not clicked: a click shakes the card instead. The choice is stored for any optional tools added
  later: check `hasConsent("analytics")` before loading one.

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
  // Server and first paint render nothing, so the prompt never flashes for people who already chose.
  const decided = useSyncExternalStore(subscribe, () => read() !== null, () => true);
  const pathname = usePathname();
  // The privacy page explains the cookies, so it stays usable while the choice is open.
  const blocking = pathname !== "/privacy";
  // Reads the saved choice; "Cookie settings" clears it and the prompt reopens.
  const open = !decided;
  const card = useRef<HTMLDivElement>(null);
  const firstButton = useRef<HTMLButtonElement>(null);
  const [shakes, setShakes] = useState(0);

  useEffect(() => {
    if (!open || !blocking) return;
    firstButton.current?.focus();
    // Keyboard users can't tab out to the page behind until they choose.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !card.current) return;
      const items = card.current.querySelectorAll<HTMLElement>("a, button");
      const first = items[0];
      const last = items[items.length - 1];
      const inside = card.current.contains(document.activeElement);
      if (!inside || (e.shiftKey && document.activeElement === first) || (!e.shiftKey && document.activeElement === last)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        if (!inside) setShakes((n) => n + 1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, blocking]);

  if (!open) return null;

  function choose(analytics: boolean) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ analytics, at: new Date().toISOString() }));
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <>
      {blocking && (
        // Invisible layer over the page: it can still be read and scrolled, but a click anywhere
        // shakes the card instead of going through.
        <div aria-hidden="true" className="fixed inset-0 z-[59]" onPointerDown={() => setShakes((n) => n + 1)} />
      )}
      <div
        ref={card}
        key={shakes}
        role={blocking ? "dialog" : "region"}
        aria-modal={blocking ? true : undefined}
        aria-labelledby="cookie-title"
        className={`fixed inset-x-2 bottom-2 z-[60] rounded-[6px] bg-page p-4 shadow-[0_0_0_1px_var(--hairline),0_8px_32px_rgba(0,0,0,0.12)] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-sm ${
          shakes > 0 ? "cookie-shake" : ""
        }`}
        style={{ marginBottom: "var(--safe-bottom)" }}
      >
        <p id="cookie-title" className="t-item">
          Cookies
        </p>
        <p className="t-item-sub mt-1">
          We use essential cookies to keep you signed in. Nothing for ads, and no tracking across other sites.
          {blocking ? " Choose an option to continue." : ""}{" "}
          <Link href="/privacy#cookies" className="underline underline-offset-4 hover:text-ink">
            Details
          </Link>
        </p>
        <div className="mt-3 flex gap-2">
          <button ref={firstButton} type="button" className="btn btn-primary btn-sm flex-1" onClick={() => choose(true)}>
            Accept all
          </button>
          <button type="button" className="btn btn-quiet btn-sm flex-1" onClick={() => choose(false)}>
            Essential only
          </button>
        </div>
      </div>
    </>
  );
}

export function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      Cookie settings
    </button>
  );
}
