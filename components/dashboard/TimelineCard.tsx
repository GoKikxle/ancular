"use client";

import { Fragment, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

// Trash bin icon — unambiguous "delete" affordance.
function TrashIcon() {
  return (
    <svg width="12" height="13" viewBox="0 0 12 13" fill="none" aria-hidden="true">
      <path
        d="M1 3.5h10M4.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 3.5l.6 7.2a1 1 0 001 .8h4.8a1 1 0 001-.8L10 3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M4.5 6.5v3M7.5 6.5v3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

const confirmSlide = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.14, ease: [0.55, 0, 1, 0.45] as const },
  },
};

export function TimelineCard({ items, tripSlug }: TimelineCardProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function requestConfirm(id: string) {
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
      setDeletingId(null);
    });
  }

  if (items.length === 0) return null;

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      <p className="mb-5 text-[11px] uppercase tracking-[0.1em] text-white/35">
        Itinerary
      </p>

      <div className="relative">
        {/* Vertical connector line */}
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

                {/* ── Item row ──────────────────────────────────────────────────
                     The whole row dims atomically when confirming or deleting,
                     rather than piecemeal per-element. pointer-events-none while
                     the delete is in-flight prevents double submissions. */}
                <div
                  className={`flex items-start gap-4 transition-opacity duration-150 ${
                    isDeleting
                      ? "pointer-events-none opacity-35"
                      : isConfirming
                      ? "opacity-55"
                      : "opacity-100"
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

                  {/* Content */}
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
                          isLater ? "text-white/30" : "text-white/45"
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

                  {/* ── Delete trigger ────────────────────────────────────────
                       Hidden while a confirmation or deletion is in progress.
                       Trash icon is semantically unambiguous as "delete". */}
                  {!isConfirming && (
                    <button
                      type="button"
                      onClick={() => requestConfirm(item.id)}
                      disabled={isPending}
                      aria-label={`Delete "${item.title}"`}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white/[0.28] transition-colors hover:text-white/50 active:text-red-400/70 disabled:opacity-30"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>

                {/* ── Confirmation row ──────────────────────────────────────────
                     Slides in below the item, aligned to the content column
                     (pl-[31px] = dot 15px + gap 16px). Full-width layout means
                     buttons have room to breathe and hit adequate touch targets. */}
                <AnimatePresence initial={false}>
                  {isConfirming && (
                    <motion.div
                      key={`confirm-${item.id}`}
                      variants={confirmSlide}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-3 pb-1 pl-[31px] pt-2.5">
                        <p className="text-[12px] text-white/35">
                          Remove this action?
                        </p>
                        <div className="flex flex-shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={cancelConfirm}
                            className="rounded-full border border-white/[0.12] px-3 py-1.5 text-[12px] text-white/40 transition-colors hover:text-white/60"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="rounded-full border border-red-500/25 bg-red-500/[0.09] px-3 py-1.5 text-[12px] font-medium text-red-400/80 transition-colors hover:bg-red-500/[0.16] hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
