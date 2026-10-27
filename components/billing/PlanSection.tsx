"use client";

import { useState } from "react";
import { goToBillingPortal, goToCheckout } from "./checkout";

/** Settings: the host's plan, with Upgrade or Manage billing. */
export function PlanSection({
  plan,
  renews,
  proPrice,
  proLimit,
  freeLimit,
  justPaid,
}: {
  plan: "free" | "pro";
  renews: string | null;
  proPrice: string;
  proLimit: number;
  freeLimit: number;
  justPaid: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<void>) {
    setError(null);
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {plan === "pro" ? (
        <>
          <p className="t-item">Pro</p>
          <p className="t-item-sub">
            Every event up to {proLimit.toLocaleString("en-GB")} photos.
            {renews ? ` Renews ${renews}.` : ""}
          </p>
          <button type="button" className="btn btn-quiet btn-lg" disabled={busy} onClick={() => run(goToBillingPortal)}>
            {busy ? "Opening…" : "Manage billing"}
          </button>
        </>
      ) : (
        <>
          <p className="t-item">{justPaid ? "Payment received. Switching you to Pro…" : "Free"}</p>
          <p className="t-item-sub">
            Each event holds {freeLimit.toLocaleString("en-GB")} photos. Unlock single events from their Photos tab, or go
            Pro for every event up to {proLimit.toLocaleString("en-GB")} photos.
          </p>
          <button type="button" className="btn btn-primary btn-lg" disabled={busy} onClick={() => run(() => goToCheckout({ kind: "pro" }))}>
            {busy ? "Opening checkout…" : `Go Pro · ${proPrice}/month`}
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="t-ui rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
