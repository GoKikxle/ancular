"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DbTrip } from "@/lib/trips";
import { SearchInput } from "@/components/ui/SearchInput";
import { TripsPageMenu } from "@/components/trips/TripsPageMenu";
import {
  screenEyebrow,
  screenHeaderWrap,
  screenSubtitle,
  screenTitle,
  surfaceCard,
  surfaceCardLinkHover,
} from "@/lib/screen-styles";

function filterTrips(trips: DbTrip[], query: string): DbTrip[] {
  const s = query.trim().toLowerCase();
  if (!s) return trips;
  return trips.filter(
    (t) =>
      t.title.toLowerCase().includes(s) || (t.destination ?? "").toLowerCase().includes(s)
  );
}

type Props = {
  trips: DbTrip[];
  variant?: "active" | "archived";
};

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function TripsIndexClient({ trips, variant = "active" }: Props) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => filterTrips(trips, q), [trips, q]);
  const searching = q.trim().length > 0;
  const noMatches = searching && filtered.length === 0;
  const archived = variant === "archived";

  const title = archived ? "Archived" : "All trips";
  const subtitle = archived
    ? "Trips you marked as completed"
    : "Active trips — complete one when you’re done to add it to Stats";

  return (
    <>
      <header className={screenHeaderWrap}>
        <p className={screenEyebrow}>Trips</p>
        <h1 className={screenTitle}>{title}</h1>
        <p className={screenSubtitle}>{subtitle}</p>
      </header>

      <div className="mb-6 flex flex-row items-stretch gap-2">
        {trips.length > 0 ? (
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder={archived ? "Search archived trips" : "Search by trip name or destination"}
            label={archived ? "Search archived trips" : "Search trips"}
            className="min-w-0 flex-1"
          />
        ) : (
          <div className="min-w-0 flex-1" aria-hidden />
        )}
        <Link
          href="/trips/new"
          aria-label="New trip"
          title="New trip"
          className="flex h-12 w-12 shrink-0 items-center justify-center self-center rounded-2xl border border-white/[0.12] bg-white/[0.06] text-white/85 transition-colors hover:bg-white/[0.1] active:scale-[0.98]"
        >
          <PlusIcon />
        </Link>
        <div className="flex shrink-0 items-center">
          <TripsPageMenu />
        </div>
      </div>

      {trips.length === 0 ? (
        <div className={`${surfaceCard} px-6 py-10 text-center`}>
          <p className="text-[16px] font-semibold text-white/80">
            {archived ? "No archived trips yet" : "No trips yet"}
          </p>
          <p className="mx-auto mt-2 max-w-[280px] text-[14px] leading-relaxed text-white/45">
            {archived
              ? "When you mark a trip as completed, it will show up here and in your Stats."
              : "Create your first trip to start planning itineraries, documents, and timeline."}
          </p>
          {!archived && (
            <Link
              href="/trips/new"
              className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-6 py-3 text-[14px] font-semibold text-neutral-950 transition-opacity hover:opacity-95 active:scale-[0.98]"
            >
              Create a trip
            </Link>
          )}
        </div>
      ) : noMatches ? (
        <div className={`${surfaceCard} px-6 py-10 text-center`}>
          <p className="text-[16px] font-semibold text-white/75">No matching trips</p>
          <p className="mx-auto mt-2 max-w-[260px] text-[14px] text-white/42">Try another search.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((trip) => {
            const statusLabel = archived ? "Completed" : trip.status;
            const statusClass = archived
              ? "bg-white/[0.08] text-white/55"
              : trip.status === "Active"
                ? "bg-emerald-500/12 text-emerald-300/95"
                : trip.status === "Upcoming"
                  ? "bg-amber-500/12 text-amber-200/90"
                  : "bg-white/[0.08] text-white/50";

            return (
              <li key={trip.id}>
                <Link
                  href={`/trips/${trip.slug}`}
                  className={`${surfaceCard} block p-6 ${surfaceCardLinkHover}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-[17px] font-bold leading-snug tracking-[-0.02em] text-white">{trip.title}</h2>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-white/48">
                        {trip.dates}
                        {trip.travelers ? ` · ${trip.travelers}` : null}
                      </p>
                      {trip.destination?.trim() ? (
                        <p className="mt-1 text-[13px] text-white/38">{trip.destination.trim()}</p>
                      ) : null}
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusClass}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  {trip.next_action_title?.trim() && !archived ? (
                    <p className="mt-3 border-t border-white/[0.06] pt-3 text-[12px] leading-relaxed text-white/40">
                      {trip.next_action_title.trim()}
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
