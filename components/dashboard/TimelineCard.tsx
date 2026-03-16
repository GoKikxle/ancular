"use client";

import { Fragment, useState, useTransition } from "react";
import { shouldShowGroupDivider, GROUP_DIVIDER_LABELS } from "@/lib/timeline-view-model";
import { deleteTimelineItemAction } from "@/app/trips/[tripId]/actions";

export type TimelineItem = {
  id: string;
  time: string;
  title: string;
  note: string;
  /** Physical location or gate info. TODO: backed by `location` column in timeline_items */
  location?: string | null;
  /** Label for an associated document (e.g. "Boarding Pass"). TODO: backed by `document_label` column */
  document_label?: string | null;
};

type TimelineCardProps = {
  items: TimelineItem[];
  tripSlug: string;
};

export function TimelineCard({ items, tripSlug }: TimelineCardProps) {
  // ID of the item currently showing the inline "Delete?" confirmation.
  // Only one item can be in confirm state at a time.
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  // ID of the item currently being deleted (used to show pending state).
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function requestConfirm(id: string) {
    // Tapping a different item's × while another is in confirm: switch focus.
    setConfirmingId(id);
  }

  function cancelConfirm() {
    setConfirmingId(null);
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    setConfirmingId(null);
    startTransition(async () => {
      await deleteTimelineItemAction(id, tripSlug);
      // revalidatePath in the action remounts this component with updated items.
      // Reset local state defensively in case the component stays mounted.
      setDeletingId(null);
    });
  }

  if (items.length === 0) return null;

  return (
    // Note: id="timeline" lives on the page wrapper div in page.tsx, not here.
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      <p className="mb-5 text-[11px] uppercase tracking-[0.1em] text-white/35">
        Itinerary
      </p>

      <div className="relative">
        {/* Vertical connector line — runs behind all items */}
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-white/[0.07]" />

        <div>
          {items.map((item, i) => {
            const divider = shouldShowGroupDivider(i);
            const isLater = i >= 3;
            const isConfirming = confirmingId === item.id;
            const isDeleting = deletingId === item.id && isPending;

            return (
              <Fragment key={item.id}>
                {/* ── Group divider ─────────────────────────────────────────── */}
                {divider && (
                  <div
                    className={`flex items-center gap-3 pl-[31px] ${
                      i > 0 ? "mb-4 mt-6" : "mb-4"
                    }`}
                  >
                    <span className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/32">
                      {GROUP_DIVIDER_LABELS[divider]}
                    </span>
                    <div className="h-px flex-1 bg-white/[0.09]" />
                  </div>
                )}

                {/* ── Timeline item ──────────────────────────────────────────── */}
                <div
                  className={`flex items-start gap-4 transition-opacity ${
                    isDeleting ? "opacity-40" : "opacity-100"
                  } ${i > 0 && !divider ? "mt-6" : i > 0 ? "" : ""}`}
                >
                  {/* Dot */}
                  <div className="relative z-10 mt-[3px] flex-shrink-0">
                    <div
                      className={`h-[15px] w-[15px] rounded-full border-2 ${
                        i === 0
                          ? "border-sky-400 bg-sky-400"
                          : isLater
                          ? "border-white/[0.12] bg-[#0a0a0a]"
                          : "border-white/[0.22] bg-[#0a0a0a]"
                      }`}
                    />
                  </div>

                  {/* Content — flex-1 so delete affordance never overlaps it */}
                  <div className="min-w-0 flex-1 pb-1">
                    <p
                      className={`text-[12px] font-medium tabular-nums ${
                        i === 0
                          ? "text-sky-400"
                          : isLater
                          ? "text-white/28"
                          : "text-sky-400/60"
                      }`}
                    >
                      {item.time}
                    </p>

                    <h3
                      className={`mt-0.5 font-semibold tracking-[-0.01em] ${
                        isConfirming ? "text-white/40" : ""
                      } ${
                        i === 0
                          ? "text-[16px] text-white"
                          : isLater
                          ? "text-[14px] text-white/55"
                          : "text-[15px] text-white/90"
                      }`}
                    >
                      {item.title}
                    </h3>

                    {item.note && (
                      <p
                        className={`mt-1 text-[13px] leading-relaxed ${
                          isConfirming
                            ? "text-white/20"
                            : isLater
                            ? "text-white/30"
                            : "text-white/45"
                        }`}
                      >
                        {item.note}
                      </p>
                    )}

                    {item.location && (
                      <p className="mt-1.5 text-[12px] text-white/28">
                        <span className="mr-1 text-white/18">at</span>
                        {item.location}
                      </p>
                    )}

                    {item.document_label && (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/38">
                        {item.document_label}
                      </span>
                    )}
                  </div>

                  {/* ── Delete affordance ──────────────────────────────────────
                       Normal state: subtle × icon.
                       Confirm state: inline Cancel + Delete pill buttons.
                       Deleting state: spinner-like opacity fade on the whole row. */}
                  <div className="flex-shrink-0 pt-0.5">
                    {isConfirming ? (
                      /* ── Inline confirmation ─────────────────────────────── */
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={cancelConfirm}
                          disabled={isDeleting}
                          className="rounded-full border border-white/[0.10] px-2.5 py-1 text-[11px] text-white/35 transition-colors hover:text-white/55 disabled:opacity-40"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={isDeleting}
                          className="rounded-full border border-red-500/25 bg-red-500/[0.08] px-2.5 py-1 text-[11px] font-medium text-red-400/70 transition-colors hover:bg-red-500/[0.14] hover:text-red-400 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      /* ── Delete trigger ──────────────────────────────────── */
                      <button
                        type="button"
                        onClick={() => requestConfirm(item.id)}
                        disabled={isPending}
                        aria-label={`Delete "${item.title}"`}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-white/[0.18] transition-colors hover:text-white/40 active:text-red-400/60 disabled:opacity-30"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
