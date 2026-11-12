"use client";

import Link from "next/link";
import { useState } from "react";
import { goToCheckout } from "@/components/billing/checkout";
import {
  FREE_PHOTOS_PER_EVENT,
  PASS_PHOTOS_PER_EVENT,
  PRICES,
  PRO_PHOTOS_PER_EVENT,
  formatMoney,
  type Currency,
} from "@/lib/plans";

const n = (x: number) => x.toLocaleString("en-GB");

type PlanId = "free" | "pass" | "pro";

function IconFree() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}
function IconPass() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8V6h18v2a2.5 2.5 0 0 0 0 5v5H3v-5a2.5 2.5 0 0 0 0-5z" />
      <path d="M14 6v12" strokeDasharray="1.5 2.5" />
    </svg>
  );
}
function IconPro() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 12c-2-2.7-3.6-4-5.5-4a4 4 0 0 0 0 8c1.9 0 3.5-1.3 5.5-4zm0 0c2 2.7 3.6 4 5.5 4a4 4 0 0 0 0-8c-1.9 0-3.5 1.3-5.5 4z" />
    </svg>
  );
}

function Check() {
  return (
    <span className="pc-check" aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 8.5l2.2 2.2L11.5 5.8" />
      </svg>
    </span>
  );
}

/**
 * Three plan cards. Currency follows location (₦ in Nigeria, £ elsewhere).
 * Cards are selectable; hosts buy after sign-in (Pro from Settings, Event pass from an event).
 */
export function Plans({
  currency,
  signedIn = false,
  billingOn = false,
}: {
  currency: Currency;
  signedIn?: boolean;
  billingOn?: boolean;
}) {
  const [selected, setSelected] = useState<PlanId>("pass");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const price = PRICES[currency];

  const plans: {
    id: PlanId;
    name: string;
    Icon: typeof IconFree;
    badge?: string;
    for: string;
    price: string;
    unit: string;
    points: string[];
    cta: string;
  }[] = [
    {
      id: "free",
      name: "Free",
      Icon: IconFree,
      for: "Try Ancular on a real event.",
      price: formatMoney(0, currency),
      unit: "/ event",
      points: [`${n(FREE_PHOTOS_PER_EVENT)} photos per event`, "Unlimited guests", "Selfie search, side angles included", "Save all, send on WhatsApp"],
      cta: signedIn ? "Go to your events" : "Start free",
    },
    {
      id: "pass",
      name: "Event pass",
      Icon: IconPass,
      badge: "Most events",
      for: "Weddings, parties and graduations.",
      price: formatMoney(price.pass, currency),
      unit: "/ event, once",
      points: [`Up to ${n(PASS_PHOTOS_PER_EVENT)} photos`, "Everything in Free", "Pay only when you need more", "No subscription"],
      cta: signedIn ? "Unlock on an event" : "Get Event pass",
    },
    {
      id: "pro",
      name: "Pro",
      Icon: IconPro,
      for: "Photographers, churches and organisers.",
      price: formatMoney(price.pro, currency),
      unit: "/ month",
      points: [`Every event up to ${n(PRO_PHOTOS_PER_EVENT)} photos`, "Unlimited events", "Everything in Free", "Cancel any time"],
      cta: signedIn && billingOn ? "Go Pro" : signedIn ? "Open Settings" : "Go Pro",
    },
  ];

  async function buyPro() {
    setError(null);
    setBusy(true);
    try {
      await goToCheckout({ kind: "pro" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't open checkout. Try again.");
      setBusy(false);
    }
  }

  function hrefFor(id: PlanId) {
    if (!signedIn) {
      if (id === "free") return "/waitlist";
      return `/login?next=${encodeURIComponent(id === "pro" ? "/settings" : "/dashboard")}`;
    }
    if (id === "pro") return "/settings";
    return "/dashboard";
  }

  return (
    <div>
      <p className="text-center text-[13px] font-medium text-ink-3">
        Prices in {currency === "NGN" ? "naira" : "pounds"}
        {currency === "NGN" ? " · checkout charges in pounds for now" : ""}
      </p>

      <ul className="mt-8 grid gap-4 md:grid-cols-3" role="listbox" aria-label="Plans">
        {plans.map(({ id, name, Icon, badge, for: who, price: p, unit, points, cta }) => {
          const active = selected === id;
          const checkoutPro = id === "pro" && signedIn && billingOn;
          return (
            <li key={id}>
              <div
                className="pc-card"
                data-highlight={!!badge}
                data-selected={active}
                role="option"
                aria-selected={active}
                tabIndex={0}
                onClick={() => setSelected(id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(id);
                  }
                }}
              >
                <div className="pc-head">
                  <h2>{name}</h2>
                  {badge && <span className="pc-badge">{badge}</span>}
                </div>
                <div className="pc-body">
                  <span className="pc-icon">
                    <Icon />
                  </span>
                  <p className="pc-for">{who}</p>
                  <p className="pc-price">
                    <span key={p} className="count-in">
                      {p}
                    </span>
                    <span className="pc-unit">{unit}</span>
                  </p>
                  <ul className="pc-points">
                    {points.map((pt) => (
                      <li key={pt}>
                        <Check />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <div className="pc-cta">
                    {checkoutPro ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-pill w-full"
                        disabled={busy}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(id);
                          void buyPro();
                        }}
                      >
                        {busy ? "Opening checkout…" : `${cta} · ${formatMoney(price.pro, currency)}/month`}
                      </button>
                    ) : (
                      <Link
                        href={hrefFor(id)}
                        className={`btn btn-pill w-full ${active || badge ? "btn-primary" : "btn-quiet"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(id);
                        }}
                      >
                        {cta}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {error && (
        <p role="alert" className="t-ui mt-4 text-center !text-danger">
          {error}
        </p>
      )}
      {signedIn && (
        <p className="t-meta mt-6 text-center">
          Event pass is bought from an event&apos;s Photos tab. Pro is also in Settings.
        </p>
      )}
    </div>
  );
}
