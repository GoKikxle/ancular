import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/billing";

/**
 * Stripe tells us when a payment or subscription changes. This is the only place
 * plans are written. Set the endpoint in Stripe to https://ancular.com/api/stripe/webhook
 * with these events: checkout.session.completed, customer.subscription.updated,
 * customer.subscription.deleted.
 *
 * The Stripe account may be shared with other products (such as Komon), so only
 * events Ancular created are acted on: every Ancular checkout and subscription
 * carries metadata.app = "ancular". Anything else gets a 200 and is ignored.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(payload, request.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.metadata?.app !== "ancular") return NextResponse.json({ ok: true, ignored: true });
    const kind = s.metadata?.kind;
    const userId = s.metadata?.user_id;
    if (!userId) return NextResponse.json({ ok: true });
    const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id;

    if (customerId) {
      await admin
        .from("host_billing")
        .upsert({ user_id: userId, stripe_customer_id: customerId, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    }

    if (kind === "pass" && s.payment_status === "paid" && s.metadata?.event_id) {
      await admin
        .from("events")
        .update({ plan: "pass", paid_at: new Date().toISOString() })
        .eq("id", s.metadata.event_id);
    }

    if (kind === "pro") {
      const subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
      await admin
        .from("host_billing")
        .upsert(
          {
            user_id: userId,
            plan: "pro",
            stripe_customer_id: customerId ?? null,
            stripe_subscription_id: subId ?? null,
            subscription_status: "active",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
    }

    await admin.from("payments").upsert(
      {
        user_id: userId,
        event_id: s.metadata?.event_id ?? null,
        kind: kind === "pro" ? "pro" : "pass",
        stripe_session_id: s.id,
        amount: s.amount_total ?? 0,
        currency: s.currency ?? "gbp",
      },
      { onConflict: "stripe_session_id" }
    );
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    if (sub.metadata?.app !== "ancular") return NextResponse.json({ ok: true, ignored: true });
    const active = event.type === "customer.subscription.updated" && ["active", "trialing", "past_due"].includes(sub.status);
    const periodEnd = sub.items?.data?.[0]?.current_period_end;
    await admin
      .from("host_billing")
      .update({
        plan: active ? "pro" : "free",
        subscription_status: sub.status,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", sub.id);
  }

  return NextResponse.json({ ok: true });
}
