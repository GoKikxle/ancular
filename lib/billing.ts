import "server-only";
import Stripe from "stripe";

/**
 * Plans.
 *   Free: any host, 200 photos per event.
 *   Event pass: £19 once, unlocks one event to 3,000 photos.
 *   Pro: £12 a month, every event up to 5,000 photos.
 * Prices live here (Stripe Checkout gets them inline), so changing a price is a code change.
 * Limits only apply once STRIPE_SECRET_KEY is set; until then the beta caps stay in force.
 */

export const CURRENCY = "gbp";
export const PASS_PRICE_PENCE = 1900;
export const PRO_PRICE_PENCE = 1200;

export const FREE_PHOTOS_PER_EVENT = 200;
export const PASS_PHOTOS_PER_EVENT = 3000;
export const PRO_PHOTOS_PER_EVENT = 5000;

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
