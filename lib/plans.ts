/**
 * Ancular's plans, in one place. The pricing page reads these, and the Stripe
 * checkout (billing branch, lib/billing.ts) should import them too, so the
 * price on the page is always the price people pay.
 *
 * Hosts pay; guests never pay to find their photos.
 * Prices are in minor units (pence, kobo). Naira payments come later via Paystack.
 * Display currency follows location (₦ in Nigeria, £ elsewhere); Stripe still charges GBP.
 *
 * Free plan rules (hosts only):
 *   - Up to FREE_LIVE_EVENTS_PER_MONTH live events per calendar month (UTC).
 *     Live = events.status 'active' (not archived/ended), created in the current month.
 *     Archiving or deleting frees a slot within the month; Pro has no event-count cap.
 *   - FREE_PHOTOS_PER_EVENT photos per event (Event pass / Pro raise the photo cap).
 * Event pass unlocks one event's photo limit only — it does not add live-event slots.
 */

export const FREE_LIVE_EVENTS_PER_MONTH = 3;
export const FREE_PHOTOS_PER_EVENT = 200;
export const PASS_PHOTOS_PER_EVENT = 3000;
export const PRO_PHOTOS_PER_EVENT = 5000;

/** Shown when a Free host tries to create a 4th live event this month. */
export const LIVE_EVENT_LIMIT_MESSAGE =
  `Free covers ${FREE_LIVE_EVENTS_PER_MONTH} live events this month. Go Pro for unlimited events.`;

export type Currency = "GBP" | "NGN";

export const PRICES = {
  GBP: { pass: 1900, pro: 1200 },
  NGN: { pass: 2500000, pro: 1500000 },
} as const satisfies Record<Currency, { pass: number; pro: number }>;

/** Show ₦ only for visitors in Nigeria. Everyone else sees £. Checkout stays GBP. */
export function displayCurrencyForCountry(country: string | null | undefined): Currency {
  return country?.trim().toUpperCase() === "NG" ? "NGN" : "GBP";
}

export function formatMoney(minor: number, currency: Currency) {
  const whole = minor / 100;
  return new Intl.NumberFormat(currency === "GBP" ? "en-GB" : "en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: whole % 1 === 0 ? 0 : 2,
  }).format(whole);
}
