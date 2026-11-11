import "server-only";
import Stripe from "stripe";

import {
  FREE_PHOTOS_PER_EVENT,
  PASS_PHOTOS_PER_EVENT,
  PRICES,
  PRO_PHOTOS_PER_EVENT,
} from "./plans";

/**
 * Stripe side of the plans. Prices and limits come from lib/plans.ts, the same file
 * the pricing page reads, so checkout always charges what the page shows.
 *   Free: any host, 200 photos per event.
 *   Event pass: one payment, unlocks one event to 3,000 photos.
 *   Pro: monthly, every event up to 5,000 photos.
 * Stripe Checkout gets prices inline, so changing a price is a change to lib/plans.ts.
 * Limits only apply once STRIPE_SECRET_KEY is set; until then the beta caps stay in force.
 * Charged in pounds for now; naira comes later through Paystack.
 */

export const CURRENCY = "gbp";
export const PASS_PRICE_PENCE = PRICES.GBP.pass;
export const PRO_PRICE_PENCE = PRICES.GBP.pro;

export { FREE_PHOTOS_PER_EVENT, PASS_PHOTOS_PER_EVENT, PRO_PHOTOS_PER_EVENT };

export type EventPlan = "free" | "pass";
export type HostPlan = "free" | "pro";

export function billingEnabled() {
  return !!process.env.STRIPE_SECRET_KEY;
}

let client: Stripe | null = null;
export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is missing from the environment");
  client ??= new Stripe(key);
  return client;
}

/** Photo limit for one event, given the event's plan and its owner's plan. */
export function eventPhotoLimit(eventPlan: EventPlan, hostPlan: HostPlan) {
  if (hostPlan === "pro") return PRO_PHOTOS_PER_EVENT;
  if (eventPlan === "pass") return PASS_PHOTOS_PER_EVENT;
  return FREE_PHOTOS_PER_EVENT;
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export function formatPrice(pence: number) {
  return `£${pence % 100 === 0 ? pence / 100 : (pence / 100).toFixed(2)}`;
}
