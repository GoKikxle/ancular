import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { CURRENCY, PASS_PRICE_PENCE, PRO_PRICE_PENCE, PASS_PHOTOS_PER_EVENT, PRO_PHOTOS_PER_EVENT, billingEnabled, siteUrl, stripe } from "@/lib/billing";

/**
 * Start a Stripe Checkout.
 *   { kind: "pass", eventId } — one payment that unlocks one event.
 *   { kind: "pro" } — monthly subscription for the signed-in host.
 * The plan only changes when Stripe's webhook confirms payment (app/api/stripe/webhook).
 */
export async function POST(request: Request) {
  if (!billingEnabled()) return NextResponse.json({ error: "Payments aren't switched on yet." }, { status: 503 });
  const { supabase, user, emailVerified } = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in again to pay." }, { status: 401 });
  if (!emailVerified) return NextResponse.json({ error: "Confirm your email before paying." }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as { kind?: string; eventId?: string };
  const { data: billing } = await supabase
    .from("host_billing")
    .select("stripe_customer_id, plan")
    .eq("user_id", user.id)
    .maybeSingle();
  const customer = billing?.stripe_customer_id
    ? { customer: billing.stripe_customer_id as string }
    : { customer_email: user.email ?? undefined };
  const base = siteUrl();

  if (body.kind === "pass") {
    if (!body.eventId) return NextResponse.json({ error: "Choose an event to unlock." }, { status: 400 });
    // Only a host of this event can see it with plan info.
    const { data: event } = await supabase
      .from("events")
      .select("id, name, plan")
      .eq("id", body.eventId)
      .maybeSingle();
    if (!event) return NextResponse.json({ error: "That event isn't available." }, { status: 404 });
    if (event.plan === "pass") return NextResponse.json({ error: "This event is already unlocked." }, { status: 409 });

    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      ...customer,
      ...(billing?.stripe_customer_id ? {} : { customer_creation: "always" as const }),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: PASS_PRICE_PENCE,
            product_data: {
              name: `Event pass: ${event.name}`.slice(0, 120),
              description: `Up to ${PASS_PHOTOS_PER_EVENT.toLocaleString("en-GB")} photos for this event.`,
            },
          },
        },
      ],
      metadata: { app: "ancular", kind: "pass", user_id: user.id, event_id: event.id },
      payment_intent_data: { metadata: { app: "ancular", kind: "pass", user_id: user.id, event_id: event.id } },
      success_url: `${base}/events/${event.id}?tab=photos&paid=1`,
      cancel_url: `${base}/events/${event.id}?tab=photos`,
    });
    return NextResponse.json({ url: session.url });
  }

  if (body.kind === "pro") {
    if (billing?.plan === "pro") return NextResponse.json({ error: "You're already on Pro." }, { status: 409 });
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      ...customer,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: PRO_PRICE_PENCE,
            recurring: { interval: "month" },
            product_data: {
              name: "Ancular Pro",
              description: `Every event up to ${PRO_PHOTOS_PER_EVENT.toLocaleString("en-GB")} photos.`,
            },
          },
        },
      ],
      metadata: { app: "ancular", kind: "pro", user_id: user.id },
      subscription_data: { metadata: { app: "ancular", kind: "pro", user_id: user.id } },
      success_url: `${base}/settings?paid=1`,
      cancel_url: `${base}/settings`,
    });
    return NextResponse.json({ url: session.url });
  }

  return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
}
