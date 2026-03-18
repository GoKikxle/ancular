"use client";

import { useState } from "react";
import type { Suggestion, SuggestionCategory } from "@/lib/trip-suggestions";
import { MessageSheet } from "@/components/ui/MessageSheet";

// ─── Category styles ──────────────────────────────────────────────────────────

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

type Props = {
  suggestions: Suggestion[];
  tripTitle: string;
};

/**
 * "Good to Know" — supportive travel context, not primary actions.
 * Cards show a concise preview; tap to open full text in a sheet.
 * No add-to-timeline or other action CTAs.
 */
export function TripSuggestionsCard({
  suggestions,
  tripTitle,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const expanded = expandedId ? suggestions.find((s) => s.id === expandedId) : null;

  if (suggestions.length === 0) return null;

  return (
    <>
      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.02] px-6 py-6">
        {/* ── Section header ───────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
            Good to Know
          </p>
          <p className="mt-1.5 text-[13px] text-white/30">{tripTitle}</p>
        </div>

        {/* ── Info cards — tappable for full text ───────────────────────────── */}
        <ul className="space-y-4">
          {suggestions.map((s) => {
            const { dot, text, label } = CATEGORY_STYLES[s.category];

            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(s.id)}
                  className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-5 text-left transition-all duration-200 hover:border-white/[0.09] hover:bg-white/[0.045] active:scale-[0.995]"
                >
                  {/* Meta row: category dot + label · best_time */}
                  <div className="mb-3 flex items-center gap-2.5">
                    <span
                      className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${dot}`}
                      aria-hidden="true"
                    />
                    <span className={`text-[11px] font-medium ${text}`}>
                      {label}
                    </span>
                    {s.best_time && (
                      <span className="text-[11px] text-white/22">
                        · {s.best_time}
                      </span>
                    )}
                  </div>

                  {/* Title — primary hierarchy */}
                  <p className="text-[15px] font-semibold leading-snug tracking-[-0.015em] text-white/92">
                    {s.title}
                  </p>

                  {/* Preview — clean, readable, invites expansion */}
                  <p className="mt-2.5 line-clamp-2 text-[13px] leading-[1.5] text-white/45">
                    {s.description}
                  </p>

                  {/* Subtle affordance */}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-white/28">
                    Read full tip
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path
                        d="M3.5 2.5l3 2.5-3 2.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Full-text sheet */}
      {expanded && (
        <MessageSheet
          isOpen={!!expanded}
          onClose={() => setExpandedId(null)}
          title={expanded.title}
          body={expanded.description}
          categoryLabel={CATEGORY_STYLES[expanded.category].label}
        />
      )}
    </>
  );
}
