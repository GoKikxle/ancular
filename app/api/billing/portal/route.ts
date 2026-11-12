import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { billingEnabled, siteUrl, stripe } from "@/lib/billing";

/** Stripe's billing page: change card, see invoices, cancel Pro. */
export async function POST() {
  if (!billingEnabled()) return NextResponse.json({ error: "Payments aren't switched on yet." }, { status: 503 });
  const { supabase, user, emailVerified } = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  if (!emailVerified) return NextResponse.json({ error: "Confirm your email first." }, { status: 403 });
  const { data: billing } = await supabase
    .from("host_billing")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!billing?.stripe_customer_id) return NextResponse.json({ error: "No billing account yet." }, { status: 404 });
  const session = await stripe().billingPortal.sessions.create({
    customer: billing.stripe_customer_id as string,
    return_url: `${siteUrl()}/settings`,
  });
  return NextResponse.json({ url: session.url });
}
