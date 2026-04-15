"use client";

import { useState } from "react";
import { UploadDocumentForm } from "@/components/documents/UploadDocumentForm";
import { surfaceCardLight } from "@/lib/screen-styles";

export type VaultTripOption = { id: string; slug: string; title: string };

type Props = {
  trips: VaultTripOption[];
  onClose: () => void;
};

/**
 * Full-width upload card shown below the search row when user taps +.
 */
export function VaultAddDocumentPanel({ trips, onClose }: Props) {
  const [slug, setSlug] = useState(trips[0]?.slug ?? "");

  const selected = trips.find((t) => t.slug === slug) ?? trips[0];

  return (
    <div className={`${surfaceCardLight} space-y-4 p-5`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold text-[#111111] dark:text-white">Upload document</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-3 py-1.5 text-[12px] font-medium text-[#9A9A9A] transition-colors hover:bg-[#F5F5F5] hover:text-[#111111] dark:text-white/45 dark:hover:bg-white/[0.08] dark:hover:text-white"
        >
          Close
        </button>
      </div>

      {trips.length === 0 ? (
        <p className="text-[14px] leading-relaxed text-[#9A9A9A] dark:text-white/45">
          Create a trip first—documents are stored and attached to a trip.
        </p>
      ) : (
        <>
          <div>
            <label
              htmlFor="vault-trip-select"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA]"
            >
              Attach to trip
            </label>
            <select
              id="vault-trip-select"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-12 w-full rounded-[12px] border border-[#E5E5E5] bg-white px-4 text-[14px] text-[#111111] focus:border-[#D0D0D0] focus:outline-none dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:focus:border-white/[0.18]"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.slug}>
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
              onVaultDone={onClose}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
