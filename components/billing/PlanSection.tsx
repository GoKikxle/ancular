"use client";

import { useState } from "react";
import { goToBillingPortal, goToCheckout } from "./checkout";

/** Settings: choose Free or Pro. Event pass is bought on an event's Photos tab. */
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
  const [selected, setSelected] = useState<"free" | "pro">(plan === "pro" ? "pro" : "free");
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

  if (plan === "pro") {
    return (
      <div className="space-y-4">
        <p className="t-item">Pro</p>
        <p className="t-item-sub">
          Every event up to {proLimit.toLocaleString("en-GB")} photos.
          {renews ? ` Renews ${renews}.` : ""}
        </p>
        <button type="button" className="btn btn-quiet btn-lg" disabled={busy} onClick={() => run(goToBillingPortal)}>
          {busy ? "Opening…" : "Manage billing"}
        </button>
        {error && (
          <p role="alert" className="t-ui rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {justPaid ? (
        <p className="t-item-sub" aria-live="polite">
          Payment received. Switching you to Pro…
        </p>
      ) : (
        <p className="t-item-sub">
          Each event holds {freeLimit.toLocaleString("en-GB")} photos on Free. Unlock a single event from its Photos
          tab, or go Pro for every event.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2" role="listbox" aria-label="Plan">
        <button
          type="button"
          role="option"
          aria-selected={selected === "free"}
          className="rounded-[4px] border border-hairline bg-white p-4 text-left transition-[border-color,box-shadow] data-[on=true]:border-ink data-[on=true]:shadow-[inset_0_0_0_1px_var(--ink)]"
          data-on={selected === "free"}
          onClick={() => setSelected("free")}
        >
          <p className="t-item">Free</p>
          <p className="t-meta mt-1">
            {freeLimit.toLocaleString("en-GB")} photos per event · current plan
          </p>
        </button>
        <button
          type="button"
          role="option"
          aria-selected={selected === "pro"}
          className="rounded-[4px] border border-hairline bg-white p-4 text-left transition-[border-color,box-shadow] data-[on=true]:border-ink data-[on=true]:shadow-[inset_0_0_0_1px_var(--ink)]"
          data-on={selected === "pro"}
          onClick={() => setSelected("pro")}
        >
          <p className="t-item">Pro · {proPrice}/month</p>
          <p className="t-meta mt-1">
            Every event up to {proLimit.toLocaleString("en-GB")} photos
          </p>
        </button>
      </div>

      {selected === "pro" ? (
        <button
          type="button"
          className="btn btn-primary btn-lg"
          disabled={busy || justPaid}
          onClick={() => run(() => goToCheckout({ kind: "pro" }))}
        >
          {busy ? "Opening checkout…" : `Go Pro · ${proPrice}/month`}
        </button>
      ) : (
        <p className="t-meta">You&apos;re on Free. Choose Pro above to upgrade, or buy an Event pass on an event.</p>
      )}

      {error && (
        <p role="alert" className="t-ui rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
