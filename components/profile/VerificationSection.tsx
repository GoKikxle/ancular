"use client";

import { useActionState } from "react";
import { requestVerification, type VerificationState } from "@/app/(app)/profile/verification-actions";
import type { MyVerification } from "@/lib/org-profile";

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function VerificationSection({
  current,
  defaults,
}: {
  current: MyVerification;
  defaults?: { name?: string | null; website?: string | null };
}) {
  const [state, action, pending] = useActionState<VerificationState, FormData>(requestVerification, undefined);

  if (current?.status === "approved") {
    return (
      <div className="space-y-2">
        <p className="t-ui font-semibold">{current.org_name} is verified</p>
        <p className="t-item-sub">
          Guests see a Verified badge on your invite pages with your name and {current.website_domain}. Verified on{" "}
          {current.decided_at ? day(current.decided_at) : "–"}. To change these details, email hello@ancular.com.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="t-item-sub">
        For organisations with their own website. Guests see a Verified badge on your invite pages with your
        organisation&apos;s name and website, so they know the link is really from you. We never show the email.
      </p>

      {current?.status === "pending" && !state?.error && (
        <p className="t-ui rounded-[4px] bg-fill px-3 py-2.5">
          Request sent on {day(current.requested_at)}. We&apos;ll email {current.contact_email} to confirm, then add
          the badge.
        </p>
      )}
      {current?.status === "declined" && (
        <p className="t-ui rounded-[4px] bg-fill px-3 py-2.5">
          We couldn&apos;t verify your last request. Check the details and try again, or email hello@ancular.com.
        </p>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="org_name" className="label">
            Organisation name
          </label>
          <input
            id="org_name"
            name="org_name"
            className="field"
            required
            maxLength={120}
            defaultValue={current?.org_name ?? defaults?.name ?? ""}
            placeholder="As guests know it"
          />
        </div>
        <div>
          <label htmlFor="website" className="label">
            Website
          </label>
          <input
            id="website"
            name="website"
            className="field"
            required
            defaultValue={current?.website_domain ?? defaults?.website ?? ""}
            placeholder="yourorganisation.org"
          />
        </div>
        <div>
          <label htmlFor="contact_email" className="label">
            Email on that website
          </label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            className="field"
            required
            defaultValue={current?.contact_email}
            placeholder="info@yourorganisation.org"
          />
          <p className="t-meta mt-2">We email this address to confirm. It doesn&apos;t need to be the one you sign in with.</p>
        </div>
        {state?.error && (
          <p role="alert" className="t-ui rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
            {state.error}
          </p>
        )}
        {state?.sent && <p className="t-ui">Request sent. We&apos;ll email you to confirm.</p>}
        <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
          {pending ? "Sending…" : current ? "Send again" : "Request verification"}
        </button>
      </form>
    </div>
  );
}
