"use client";

import { useState } from "react";
import Link from "next/link";
import { plainError } from "@/lib/errors";
import { safeNextPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

type Props = {
  /** Known email from the session or the form they just used. */
  email?: string | null;
  next?: string;
  /** Optional lead-in under the heading. */
  note?: string;
};

/**
 * Shown after signup, or when someone signs in before confirming.
 * Resends Supabase's confirmation email; the link lands on /auth/callback.
 */
export function ConfirmEmailPanel({ email: initialEmail, next, note }: Props) {
  const destination = safeNextPath(next);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`;

  async function resend() {
    setError(null);
    setMessage(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      setError("Enter the email you used to create your account.");
      return;
    }
    setLoading(true);
    const { error: err } = await createClient().auth.resend({
      type: "signup",
      email: trimmed,
      options: { emailRedirectTo: callbackUrl() },
    });
    setLoading(false);
    if (err) {
      setError(plainError(err.message, "Could not send the email. Try again in a minute."));
      return;
    }
    setMessage(`We sent another link to ${trimmed}. Open it on this phone to continue.`);
  }

  async function signOut() {
    setLoading(true);
    await createClient().auth.signOut();
    window.location.href = `/login?next=${encodeURIComponent(destination)}`;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[4px] bg-fill p-5">
        <h2 className="t-item">Confirm your email</h2>
        <p className="t-item-sub mt-1">
          {note ??
            "Open the link we sent you. Until then you can’t host events or join an invite."}
        </p>
        {initialEmail ? (
          <p className="t-meta mt-3">
            Sent to <strong className="text-ink">{initialEmail}</strong>
          </p>
        ) : (
          <div className="mt-4">
            <label htmlFor="confirm-email" className="label">
              Your email
            </label>
            <input
              id="confirm-email"
              type="email"
              inputMode="email"
              className="field"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
        )}
        {message && <p className="t-ui mt-3">{message}</p>}
        {error && (
          <p role="alert" className="t-ui mt-3 rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
            {error}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary btn-sm" onClick={resend} disabled={loading}>
            {loading ? "Sending…" : "Resend confirmation email"}
          </button>
          <button type="button" className="btn btn-quiet btn-sm" onClick={signOut} disabled={loading}>
            Use a different account
          </button>
        </div>
        <p className="t-meta mt-3">Not there after a minute? Check spam or promotions.</p>
      </div>
      <p className="t-meta">
        Already confirmed?{" "}
        <Link href={destination} className="font-semibold text-ink underline underline-offset-4">
          Continue
        </Link>
      </p>
    </div>
  );
}
