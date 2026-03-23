"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DbTrip } from "@/lib/trips";
import { SearchInput } from "@/components/ui/SearchInput";
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
};

export function TripsIndexClient({ trips }: Props) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => filterTrips(trips, q), [trips, q]);
  const searching = q.trim().length > 0;
  const noMatches = searching && filtered.length === 0;

  return (
    <>
      <header className={screenHeaderWrap}>
        <p className={screenEyebrow}>Trips</p>
        <h1 className={screenTitle}>All trips</h1>
        <p className={screenSubtitle}>Active, upcoming, and past</p>
      </header>

      <Link
        href="/trips/new"
        className="mb-6 flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.06] px-4 py-3 text-[14px] font-semibold text-white/90 transition-colors hover:bg-white/[0.1] active:scale-[0.99]"
      >
        + New trip
      </Link>

      {trips.length > 0 && (
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search by trip name or destination"
          label="Search trips"
          className="mb-4"
        />
      )}

      {trips.length === 0 ? (
        <div className={`${surfaceCard} px-6 py-10 text-center`}>
          <p className="text-[16px] font-semibold text-white/80">No trips yet</p>
          <p className="mx-auto mt-2 max-w-[260px] text-[14px] leading-relaxed text-white/45">
            Create your first trip to start planning itineraries, documents, and timeline.
          </p>
          <Link
            href="/trips/new"
            className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-6 py-3 text-[14px] font-semibold text-neutral-950 transition-opacity hover:opacity-95 active:scale-[0.98]"
          >
            Create a trip
          </Link>
        </div>
      ) : noMatches ? (
        <div className={`${surfaceCard} px-6 py-10 text-center`}>
          <p className="text-[16px] font-semibold text-white/75">No matching trips</p>
          <p className="mx-auto mt-2 max-w-[260px] text-[14px] text-white/42">Try another search.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((trip) => (
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
                    className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                      trip.status === "Active"
                        ? "bg-emerald-500/12 text-emerald-300/95"
                        : trip.status === "Upcoming"
                          ? "bg-amber-500/12 text-amber-200/90"
                          : "bg-white/[0.08] text-white/50"
                    }`}
                  >
                    {trip.status}
                  </span>
                </div>
                {trip.next_action_title?.trim() ? (
                  <p className="mt-3 border-t border-white/[0.06] pt-3 text-[12px] leading-relaxed text-white/40">
                    {trip.next_action_title.trim()}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
