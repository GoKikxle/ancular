"use client";

import { useState } from "react";
import { UploadDocumentForm } from "@/components/documents/UploadDocumentForm";
import { surfaceCard } from "@/lib/screen-styles";

export type VaultTripOption = { id: string; slug: string; title: string };

type Props = {
  trips: VaultTripOption[];
};

export function VaultAddDocumentPanel({ trips }: Props) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState(trips[0]?.slug ?? "");

  const selected = trips.find((t) => t.slug === slug) ?? trips[0];

  return (
    <div className="mb-6">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.06] px-4 py-3 text-[14px] font-semibold text-white/90 transition-colors hover:bg-white/[0.1] active:scale-[0.99]"
        >
          <span className="text-lg leading-none">+</span>
          Add document
        </button>
      ) : (
        <div className={`${surfaceCard} space-y-4 p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-bold text-white">Upload document</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-3 py-1.5 text-[12px] font-medium text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/70"
            >
              Close
            </button>
          </div>

          {trips.length === 0 ? (
            <p className="text-[14px] leading-relaxed text-white/45">
              Create a trip first—documents are stored and attached to a trip.
            </p>
          ) : (
            <>
              <div>
                <label htmlFor="vault-trip-select" className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/35">
                  Attach to trip
                </label>
                <select
                  id="vault-trip-select"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/[0.1] bg-[#0a0a0a] px-4 text-[14px] text-white focus:border-white/[0.18] focus:outline-none"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.slug} className="bg-neutral-900">
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
              {selected ? (
                <UploadDocumentForm
                  key={selected.slug}
                  tripId={selected.id}
                  tripSlug={selected.slug}
                  variant="vault"
                  onVaultDone={() => setOpen(false)}
                />
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}
