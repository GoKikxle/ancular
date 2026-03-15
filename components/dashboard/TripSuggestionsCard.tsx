"use client";

import { useState, useTransition } from "react";
import type { Suggestion, SuggestionCategory } from "@/lib/trip-suggestions";
import { addSuggestionToTimelineAction } from "@/app/trips/[tripId]/actions";

// ─── Category styles ──────────────────────────────────────────────────────────
// Each category gets a small coloured dot + a text label.
// Using a dot instead of a bordered pill keeps the card header clean and
// lets the title dominate as the visual anchor.

const CATEGORY_STYLES: Record<
  SuggestionCategory,
  { dot: string; text: string; label: string }
> = {
  food: {
    dot: "bg-amber-400/55",
    text: "text-amber-400/65",
    label: "Food",
  },
  sightseeing: {
    dot: "bg-sky-400/55",
    text: "text-sky-400/65",
    label: "Sightseeing",
  },
  transport: {
    dot: "bg-violet-400/55",
    text: "text-violet-400/65",
    label: "Transport",
  },
  "weather-aware": {
    dot: "bg-cyan-400/55",
    text: "text-cyan-400/65",
    label: "Weather",
  },
  admin: {
    dot: "bg-white/25",
    text: "text-white/32",
    label: "Prep",
  },
  relaxation: {
    dot: "bg-emerald-400/55",
    text: "text-emerald-400/65",
    label: "Relax",
  },
  culture: {
    dot: "bg-indigo-400/55",
    text: "text-indigo-400/65",
    label: "Culture",
  },
  "local-tip": {
    dot: "bg-orange-400/55",
    text: "text-orange-400/65",
    label: "Local tip",
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemState = "idle" | "pending" | "added" | { error: string };

type Props = {
  suggestions: Suggestion[];
  tripId: string;
  tripSlug: string;
  tripTitle: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function TripSuggestionsCard({
  suggestions,
  tripId,
  tripSlug,
  tripTitle,
}: Props) {
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
        setTimeout(() => setState(s.id, "idle"), 4000);
      } else {
        setState(s.id, "added");
      }
    });
  }

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      {/* ── Section header ───────────────────────────────────────────────────── */}
      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.1em] text-white/35">
          Suggested for You
        </p>
        <p className="mt-0.5 text-[12px] text-white/25">{tripTitle}</p>
      </div>

      {/* ── Suggestion list ──────────────────────────────────────────────────── */}
      <ul className="space-y-3">
        {suggestions.map((s) => {
          const itemState = getState(s.id);
          const isPending = itemState === "pending";
          const isAdded = itemState === "added";
          const errorMsg =
            typeof itemState === "object" && "error" in itemState
              ? itemState.error
              : null;

          const { dot, text, label } = CATEGORY_STYLES[s.category];

          return (
            <li
              key={s.id}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-4"
            >
              {/* ── Meta row: category dot + label · best_time ─────────────── */}
              <div className="mb-2.5 flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${dot}`}
                  aria-hidden="true"
                />
                <span className={`text-[11px] font-medium ${text}`}>
                  {label}
                </span>
                {s.best_time && (
                  <span className="text-[11px] text-white/20">
                    · {s.best_time}
                  </span>
                )}
              </div>

              {/* ── Title ──────────────────────────────────────────────────── */}
              <p className="text-[14px] font-semibold leading-snug tracking-[-0.01em] text-white/90">
                {s.title}
              </p>

              {/* ── Description ────────────────────────────────────────────── */}
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/43">
                {s.description}
              </p>

              {/* ── Footer: reason + CTA ───────────────────────────────────── */}
              <div className="mt-4 flex items-center justify-between gap-3">
                {s.reason ? (
                  <p className="text-[10px] leading-tight text-white/28">
                    {s.reason}
                  </p>
                ) : (
                  <span />
                )}

                {isAdded ? (
                  <span className="flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-2 text-[12px] font-medium text-emerald-400/80">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1.5 5L3.75 7.5L8.5 2.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Added
                  </span>
                ) : errorMsg ? (
                  <span className="flex-shrink-0 text-[11px] text-red-400/70">
                    Failed — tap to retry
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAdd(s)}
                    disabled={isPending}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.09] bg-white/[0.04] px-3 py-2 text-[12px] font-medium text-white/45 transition-colors hover:border-white/[0.15] hover:bg-white/[0.07] hover:text-white/65 active:scale-[0.97] disabled:opacity-40"
                  >
                    {isPending ? (
                      <>
                        <span
                          className="h-2.5 w-2.5 animate-spin rounded-full border border-white/20 border-t-white/55"
                          aria-hidden="true"
                        />
                        Adding…
                      </>
                    ) : (
                      <>
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M5 1.5v7M1.5 5h7"
                            stroke="currentColor"
                            strokeWidth="1.3"
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
