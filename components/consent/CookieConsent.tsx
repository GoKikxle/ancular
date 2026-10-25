"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/*
  Cookie consent. Ancular only sets essential cookies today (the sign-in
  session), which don't need consent under UK GDPR/PECR or the EU rules, but
  people should be told. The prompt blocks the site until a choice is made
  (either choice works). The choice is stored for any optional tools added
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
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  // The privacy page explains the cookies, so it stays readable while the choice is open.
  const blocking = pathname !== "/privacy";
  const open = !decided && !hidden;
  const firstButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !blocking) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstButton.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, blocking]);

  if (!open) return null;

  function choose(analytics: boolean) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ analytics, at: new Date().toISOString() }));
    } catch {}
    setHidden(true);
    window.dispatchEvent(new Event(EVENT));
  }

  const card = (
    <div
      role={blocking ? "dialog" : "region"}
      aria-modal={blocking ? true : undefined}
      aria-labelledby="cookie-title"
      className={
        blocking
          ? "w-full max-w-sm rounded-[6px] bg-page p-5 shadow-[0_0_0_1px_var(--hairline),0_16px_48px_rgba(0,0,0,0.18)]"
          : "fixed inset-x-2 bottom-2 z-40 rounded-[6px] bg-page p-4 shadow-[0_0_0_1px_var(--hairline),0_8px_32px_rgba(0,0,0,0.12)] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-sm"
      }
    >
      <p id="cookie-title" className="t-item">
        Cookies
      </p>
      <p className="t-item-sub mt-1">
        We use essential cookies to keep you signed in. Nothing for ads, and no tracking across other sites. Choose an
        option to continue.{" "}
        <Link href="/privacy#cookies" className="underline underline-offset-4 hover:text-ink">
          Details
        </Link>
      </p>
      <div className="mt-4 flex gap-2">
        <button ref={firstButton} type="button" className="btn btn-primary btn-sm flex-1" onClick={() => choose(true)}>
          Accept all
        </button>
        <button type="button" className="btn btn-quiet btn-sm flex-1" onClick={() => choose(false)}>
          Essential only
        </button>
      </div>
    </div>
  );

  if (!blocking) return card;

  // Blocking: a backdrop covers the page, so nothing behind it can be clicked or scrolled until a choice is made.
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-2 backdrop-blur-[2px] sm:items-center sm:p-4"
      style={{ paddingBottom: "max(8px, var(--safe-bottom))" }}
      onKeyDown={(e) => {
        // Keep keyboard focus inside the prompt.
        if (e.key !== "Tab") return;
        const items = e.currentTarget.querySelectorAll<HTMLElement>("a, button");
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }}
    >
      {card}
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
