"use client";

import { useState } from "react";
import {
  FREE_PHOTOS_PER_EVENT,
  PASS_PHOTOS_PER_EVENT,
  PRICES,
  PRO_PHOTOS_PER_EVENT,
  formatMoney,
  type Currency,
} from "@/lib/plans";

const n = (x: number) => x.toLocaleString("en-GB");

function IconFree() {
  // A camera: try it on one event.
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}
function IconPass() {
  // A ticket: one event.
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8V6h18v2a2.5 2.5 0 0 0 0 5v5H3v-5a2.5 2.5 0 0 0 0-5z" />
      <path d="M14 6v12" strokeDasharray="1.5 2.5" />
    </svg>
  );
}
function IconPro() {
  // Infinity: every event.
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

/** Three plan cards with a pound / naira switch. Cards follow woblo's pricing layout, without buttons. */
export function Plans() {
  const [currency, setCurrency] = useState<Currency>("GBP");
  const price = PRICES[currency];

  const plans = [
    {
      name: "Free",
      Icon: IconFree,
      for: "Try Ancular on a real event.",
      price: formatMoney(0, currency),
      unit: "/ event",
      points: [`${n(FREE_PHOTOS_PER_EVENT)} photos per event`, "Unlimited guests", "Selfie search, side angles included", "Save all, send on WhatsApp"],
    },
    {
      name: "Event pass",
      Icon: IconPass,
      badge: "Most events",
      for: "Weddings, parties and graduations.",
      price: formatMoney(price.pass, currency),
      unit: "/ event, once",
      points: [`Up to ${n(PASS_PHOTOS_PER_EVENT)} photos`, "Everything in Free", "Pay only when you need more", "No subscription"],
    },
    {
      name: "Pro",
      Icon: IconPro,
      for: "Photographers, churches and organisers.",
      price: formatMoney(price.pro, currency),
      unit: "/ month",
      points: [`Every event up to ${n(PRO_PHOTOS_PER_EVENT)} photos`, "Unlimited events", "Everything in Free", "Cancel any time"],
    },
  ];

  return (
    <div>
      <div className="flex justify-center">
        <div role="radiogroup" aria-label="Currency" className="pc-switch">
          {(["GBP", "NGN"] as const).map((c) => (
            <button key={c} type="button" role="radio" aria-checked={currency === c} onClick={() => setCurrency(c)}>
              {c === "GBP" ? "£ Pounds" : "₦ Naira"}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map(({ name, Icon, badge, for: who, price: p, unit, points }) => (
          <li key={name} className="pc-card" data-highlight={!!badge}>
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
