"use client";

/** Ask the server for a Stripe Checkout (or billing portal) page and go there. */
export async function goToCheckout(body: { kind: "pass"; eventId: string } | { kind: "pro" }) {
  const res = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Couldn't open checkout. Try again.");
  window.location.href = data.url;
}

export async function goToBillingPortal() {
  const res = await fetch("/api/billing/portal", { method: "POST" });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Couldn't open billing. Try again.");
  window.location.href = data.url;
}
