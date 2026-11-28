"use client";

import { useState, useTransition } from "react";
import { decideVerification, removeVerification } from "@/app/(admin)/admin/actions";

export type VerifiedRow = {
  user_id: string;
  org_name: string;
  website_domain: string;
  contact_email: string;
  status: "pending" | "approved" | "declined";
  requested_at: string;
  decided_at: string | null;
  note: string | null;
};

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function confirmMail(r: VerifiedRow) {
  const subject = `Confirm ${r.org_name} on Ancular`;
  const body = `Hello,

We received a request to verify ${r.org_name} (${r.website_domain}) on Ancular, so guests see a Verified badge on your event pages.

If this was you, just reply to this email to confirm. If it wasn't, ignore it and nothing will change.

Thanks,
Ancular`;
  return `mailto:${r.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function Request({ r }: { r: VerifiedRow }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const decide = (d: "approved" | "declined") =>
    start(async () => {
      const res = await decideVerification(r.user_id, d, note);
      setError(res.error ?? null);
    });
  return (
    <li className="border-b border-hairline py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="t-item">{r.org_name}</p>
        <p className="t-meta">Asked {day(r.requested_at)}</p>
      </div>
      <dl className="mt-2 grid grid-cols-[90px_1fr] gap-y-1 text-[0.875rem]">
        <dt className="t-meta">Website</dt>
        <dd>
          <a href={`https://${r.website_domain}`} target="_blank" rel="noopener noreferrer" className="underline">
            {r.website_domain}
          </a>
        </dd>
        <dt className="t-meta">Email</dt>
        <dd>{r.contact_email}</dd>
      </dl>
      <ol className="t-item-sub mt-3 list-decimal space-y-1 pl-5">
        <li>Open the website and check it&apos;s really this organisation.</li>
        <li>Send the confirmation email and wait for a reply from that address.</li>
        <li>Approve.</li>
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a href={confirmMail(r)} className="btn btn-quiet btn-sm">
          Send confirmation email
        </a>
        <input
          className="field h-9 max-w-[260px] text-[0.875rem]"
          placeholder="Note, e.g. replied 27 Nov"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-label="Note"
        />
        <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={() => decide("approved")}>
          Approve
        </button>
        <button type="button" className="btn btn-quiet btn-sm" disabled={pending} onClick={() => decide("declined")}>
          Decline
        </button>
      </div>
      {error && <p className="t-ui mt-2 !text-danger">{error}</p>}
    </li>
  );
}

export function VerifyOrganisers({ rows }: { rows: VerifiedRow[] }) {
  const pending = rows.filter((r) => r.status === "pending");
  const approved = rows.filter((r) => r.status === "approved");
  return (
    <section aria-labelledby="verified">
      <h2 id="verified" className="sr-only">
        Verified organisations
      </h2>
      <p className="t-item-sub max-w-2xl">
        Only organisations with their own website and an email on that domain. Guests see the name and website on a
        Verified badge, never the email.
      </p>

      <h3 className="t-item mt-6">Requests</h3>
      {pending.length === 0 ? (
        <p className="t-meta mt-2">No requests waiting.</p>
      ) : (
        <ul className="mt-1 max-w-3xl">
          {pending.map((r) => (
            <Request key={r.user_id} r={r} />
          ))}
        </ul>
      )}

      {approved.length > 0 && (
        <>
          <h3 className="t-item mt-8">Verified</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-[0.875rem]">
              <thead className="t-meta">
                <tr className="border-b border-hairline">
                  <th className="py-2 pr-4 font-medium">Organisation</th>
                  <th className="py-2 pr-4 font-medium">Website</th>
                  <th className="py-2 pr-4 font-medium">Confirmed with</th>
                  <th className="py-2 pr-4 font-medium">Verified</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {approved.map((r) => (
                  <tr key={r.user_id} className="border-b border-hairline">
                    <td className="py-2.5 pr-4 font-medium">{r.org_name}</td>
                    <td className="py-2.5 pr-4">{r.website_domain}</td>
                    <td className="py-2.5 pr-4">{r.contact_email}</td>
                    <td className="t-meta py-2.5 pr-4">{r.decided_at ? day(r.decided_at) : "–"}</td>
                    <td className="py-2.5 text-right">
                      <button type="button" className="btn btn-quiet btn-sm" onClick={() => removeVerification(r.user_id)}>
                        Remove badge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
