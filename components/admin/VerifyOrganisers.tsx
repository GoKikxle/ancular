"use client";

import { useActionState } from "react";
import { unverifyOrganiser, verifyOrganiser, type VerifyState } from "@/app/(app)/admin/actions";

export type VerifiedRow = { user_id: string; verified_name: string; verified_email: string; verified_at: string; note: string | null };

export function VerifyOrganisers({ rows }: { rows: VerifiedRow[] }) {
  const [state, action, pending] = useActionState<VerifyState, FormData>(verifyOrganiser, undefined);
  return (
    <section aria-labelledby="verified">
      <h2 id="verified" className="t-title">
        Verified organisers
      </h2>
      <p className="t-item-sub mt-2 max-w-2xl">
        Guests see a Verified badge on this organiser&apos;s invite pages, with the name and email below. Check both
        yourself first, for example by replying from that email.
      </p>
      <form action={action} className="mt-5 grid max-w-3xl gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="v-email" className="label">
            Account email
          </label>
          <input id="v-email" name="email" type="email" className="field" required />
        </div>
        <div>
          <label htmlFor="v-name" className="label">
            Name guests see
          </label>
          <input id="v-name" name="name" className="field" required maxLength={120} placeholder="CCI Manchester" />
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
          {pending ? "Saving…" : "Verify"}
        </button>
        <div className="sm:col-span-3">
          <label htmlFor="v-note" className="label">
            How you checked (only you see this)
          </label>
          <input id="v-note" name="note" className="field" maxLength={200} placeholder="Call with Pastor on 27 Nov" />
        </div>
      </form>
      {state?.error && <p className="t-ui mt-3 !text-danger">{state.error}</p>}
      {state?.done && <p className="t-ui mt-3">{state.done}</p>}

      {rows.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[0.875rem]">
            <thead className="t-meta">
              <tr className="border-b border-hairline">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Verified</th>
                <th className="py-2 pr-4 font-medium">Note</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user_id} className="border-b border-hairline">
                  <td className="py-2.5 pr-4 font-medium">{r.verified_name}</td>
                  <td className="py-2.5 pr-4">{r.verified_email}</td>
                  <td className="t-meta py-2.5 pr-4">
                    {new Date(r.verified_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="t-meta py-2.5 pr-4">{r.note ?? "–"}</td>
                  <td className="py-2.5 text-right">
                    <button type="button" className="btn btn-quiet btn-sm" onClick={() => unverifyOrganiser(r.user_id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
