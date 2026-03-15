"use client";

import { useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { generateItineraryAction } from "@/app/trips/[tripId]/actions";

type Props = {
  tripId: string;
  tripSlug: string;
  tripTitle: string;
  tripDates: string;
  weatherSummary?: string | null;
  weatherNote?: string | null;
  hasExistingItems: boolean;
};

type PanelState = "idle" | "success" | { error: string };

const TRAVEL_STYLES = ["Cultural", "Adventure", "Relaxation", "Business", "Family"] as const;
const PACE_OPTIONS = ["Slow", "Moderate", "Packed"] as const;

const slide = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export function ItineraryGenerator({
  tripId,
  tripSlug,
  tripTitle,
  tripDates,
  weatherSummary,
  weatherNote,
  hasExistingItems,
}: Props) {
  // Auto-open when there is no itinerary yet so the form is immediately visible.
  const [open, setOpen] = useState(!hasExistingItems);
  const [panelState, setPanelState] = useState<PanelState>("idle");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function reset() {
    formRef.current?.reset();
    setPanelState("idle");
  }

  function toggle() {
    setOpen((prev) => !prev);
    if (open) reset();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPanelState("idle");

    startTransition(async () => {
      const result = await generateItineraryAction(
        tripId,
        tripSlug,
        {
          title: tripTitle,
          dates: tripDates,
          weather_summary: weatherSummary ?? null,
          weather_note: weatherNote ?? null,
        },
        formData
      );

      if (result.error) {
        setPanelState({ error: result.error });
      } else {
        setPanelState("success");
        // Auto-close after the user reads the confirmation
        setTimeout(() => {
          setOpen(false);
          reset();
        }, 1800);
      }
    });
  }

  const errorMessage =
    typeof panelState === "object" && "error" in panelState
      ? panelState.error
      : null;

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      {/* ── Header row ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.1em] text-white/35">
            AI Itinerary
          </p>
          {!open && (
            <p className="mt-0.5 truncate text-[13px] text-white/40">
              {hasExistingItems
                ? "Regenerate with new preferences"
                : "Generate a smart day plan for this trip"}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={isPending}
          className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-40 ${
            open
              ? "border-white/[0.18] bg-white/[0.09] text-white/70"
              : "border-sky-400/30 bg-sky-400/10 text-sky-300 hover:bg-sky-400/20"
          }`}
        >
          {open ? "Cancel" : hasExistingItems ? "Regenerate" : "Generate"}
        </button>
      </div>

      {/* ── Expandable panel ──────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="gen-panel"
            variants={slide}
            initial="hidden"
            animate="show"
            exit="exit"
            className="overflow-hidden"
          >
            {panelState === "success" ? (
              /* ── Success banner ─────────────────────────────────────────── */
              <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  className="flex-shrink-0 text-emerald-400"
                >
                  <path
                    d="M2.5 7L5.5 10L11.5 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-[13px] text-emerald-300">
                  Itinerary generated and saved.
                </p>
              </div>
            ) : (
              /* ── Preference form ─────────────────────────────────────────── */
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="mt-5 space-y-4"
              >
                {/* Destination hint */}
                <div>
                  <label
                    htmlFor="gen-destination"
                    className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/30"
                  >
                    Destination / city hint
                  </label>
                  <input
                    id="gen-destination"
                    name="destination"
                    type="text"
                    placeholder="e.g. Barcelona, Tokyo, New York"
                    className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-white placeholder-white/20 transition-colors focus:border-white/[0.18] focus:outline-none"
                  />
                </div>

                {/* Travel style + Pace row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="gen-style"
                      className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/30"
                    >
                      Travel style
                    </label>
                    <select
                      id="gen-style"
                      name="travel_style"
                      defaultValue="Cultural"
                      className="w-full rounded-2xl border border-white/[0.08] bg-[#0a0a0a] px-3.5 py-2.5 text-[13px] text-white transition-colors focus:border-white/[0.18] focus:outline-none"
                    >
                      {TRAVEL_STYLES.map((s) => (
                        <option key={s} value={s} className="bg-neutral-900">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="gen-pace"
                      className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/30"
                    >
                      Pace
                    </label>
                    <select
                      id="gen-pace"
                      name="pace"
                      defaultValue="Moderate"
                      className="w-full rounded-2xl border border-white/[0.08] bg-[#0a0a0a] px-3.5 py-2.5 text-[13px] text-white transition-colors focus:border-white/[0.18] focus:outline-none"
                    >
                      {PACE_OPTIONS.map((p) => (
                        <option key={p} value={p} className="bg-neutral-900">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label
                    htmlFor="gen-interests"
                    className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/30"
                  >
                    Interests
                  </label>
                  <input
                    id="gen-interests"
                    name="interests"
                    type="text"
                    placeholder="e.g. food, museums, beaches, nightlife"
                    className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-white placeholder-white/20 transition-colors focus:border-white/[0.18] focus:outline-none"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="gen-notes"
                    className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/30"
                  >
                    Notes{" "}
                    <span className="normal-case text-white/20">(optional)</span>
                  </label>
                  <textarea
                    id="gen-notes"
                    name="notes"
                    rows={2}
                    placeholder="Any specific requirements, accessibility needs, or context"
                    className="w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-white placeholder-white/20 transition-colors focus:border-white/[0.18] focus:outline-none"
                  />
                </div>

                {/* Replace warning */}
                {hasExistingItems && (
                  <p className="text-[11px] text-amber-400/50">
                    This will replace your current itinerary items.
                  </p>
                )}

                {/* Inline error */}
                {errorMessage && (
                  <p className="rounded-2xl border border-red-500/20 bg-red-500/[0.07] px-3.5 py-2.5 text-[12px] text-red-300">
                    {errorMessage}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={toggle}
                    disabled={isPending}
                    className="flex-1 rounded-2xl border border-white/[0.07] py-2.5 text-[13px] text-white/40 transition-colors hover:text-white/60 disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    disabled={isPending}
                    className="flex-1 rounded-2xl border border-sky-400/20 bg-sky-500/15 py-2.5 text-[13px] font-medium text-sky-300 transition-colors hover:bg-sky-500/20 disabled:opacity-40"
                  >
                    {isPending
                      ? "Generating…"
                      : hasExistingItems
                      ? "Regenerate Itinerary"
                      : "Generate Itinerary"}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
