"use client";

import { useState, useTransition } from "react";
import type { Suggestion, SuggestionCategory } from "@/lib/trip-suggestions";
import { addSuggestionToTimelineAction } from "@/app/trips/[tripId]/actions";

// ─── Category styling ─────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<
  SuggestionCategory,
  { pill: string; label: string }
> = {
  food: {
    pill: "border-amber-500/20 bg-amber-500/[0.08] text-amber-400/75",
    label: "Food",
  },
  sightseeing: {
    pill: "border-sky-500/20 bg-sky-500/[0.08] text-sky-400/75",
    label: "Sightseeing",
  },
  transport: {
    pill: "border-violet-500/20 bg-violet-500/[0.08] text-violet-400/75",
    label: "Transport",
  },
  "weather-aware": {
    pill: "border-cyan-500/20 bg-cyan-500/[0.08] text-cyan-400/75",
    label: "Weather",
  },
  admin: {
    pill: "border-white/[0.10] bg-white/[0.04] text-white/35",
    label: "Prep",
  },
  relaxation: {
    pill: "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400/75",
    label: "Relax",
  },
  culture: {
    pill: "border-indigo-500/20 bg-indigo-500/[0.08] text-indigo-400/75",
    label: "Culture",
  },
  "local-tip": {
    pill: "border-orange-500/20 bg-orange-500/[0.08] text-orange-400/75",
    label: "Local tip",
  },
};

// ─── Per-suggestion state ─────────────────────────────────────────────────────

type ItemState = "idle" | "pending" | "added" | { error: string };

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  suggestions: Suggestion[];
  tripId: string;
  tripSlug: string;
};

export function TripSuggestionsCard({ suggestions, tripId, tripSlug }: Props) {
  const [states, setStates] = useState<Record<string, ItemState>>({});
  const [, startTransition] = useTransition();

  if (suggestions.length === 0) return null;

  function getState(id: string): ItemState {
    return states[id] ?? "idle";
  }

  function setState(id: string, next: ItemState) {
    setStates((prev) => ({ ...prev, [id]: next }));
  }

  function handleAdd(s: Suggestion) {
    const current = getState(s.id);
    if (current === "pending" || current === "added") return;

    setState(s.id, "pending");

    startTransition(async () => {
      const result = await addSuggestionToTimelineAction(tripId, tripSlug, {
        title: s.title,
        description: s.description,
        suggested_time: s.suggested_time,
      });

      if (result.error) {
        setState(s.id, { error: result.error });
        // Clear error after 4 seconds so the button becomes usable again
        setTimeout(() => setState(s.id, "idle"), 4000);
      } else {
        setState(s.id, "added");
      }
    });
  }

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.1em] text-white/35">
          Suggested for You
        </p>
        <p className="mt-0.5 text-[12px] text-white/25">
          Contextual picks based on your trip
        </p>
      </div>

      {/* ── Suggestion list ──────────────────────────────────────────────────── */}
      <ul className="space-y-2.5">
        {suggestions.map((s) => {
          const itemState = getState(s.id);
          const isPending = itemState === "pending";
          const isAdded = itemState === "added";
          const errorMsg =
            typeof itemState === "object" && "error" in itemState
              ? itemState.error
              : null;

          const { pill, label } = CATEGORY_STYLES[s.category];

          return (
            <li
              key={s.id}
              className="rounded-2xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-3.5"
            >
              {/* Row 1: category pill + optional best_time */}
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${pill}`}
                >
                  {label}
                </span>

                {s.best_time && (
                  <span className="text-[10px] text-white/22">
                    {s.best_time}
                  </span>
                )}
              </div>

              {/* Row 2: title */}
              <p className="text-[13px] font-semibold leading-snug text-white/88">
                {s.title}
              </p>

              {/* Row 3: description */}
              <p className="mt-1 text-[12px] leading-relaxed text-white/38">
                {s.description}
              </p>

              {/* Row 4: reason + Add button */}
              <div className="mt-3 flex items-center justify-between gap-3">
                {s.reason ? (
                  <p className="text-[10px] text-white/20">{s.reason}</p>
                ) : (
                  <span />
                )}

                {/* Add to timeline CTA */}
                {isAdded ? (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400/80">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 11 11"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1.5 5.5L4 8L9.5 3"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Added
                  </span>
                ) : errorMsg ? (
                  <span className="text-[11px] text-red-400/70">
                    {errorMsg}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAdd(s)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-white/45 transition-colors hover:border-white/[0.12] hover:text-white/65 disabled:opacity-40"
                  >
                    {isPending ? (
                      <>
                        <span
                          className="inline-block h-2 w-2 animate-spin rounded-full border border-white/20 border-t-white/60"
                          aria-hidden="true"
                        />
                        Adding…
                      </>
                    ) : (
                      <>
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 9 9"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M4.5 1v7M1 4.5h7"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                        Add to timeline
                      </>
                    )}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
