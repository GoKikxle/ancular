"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DbTrip } from "@/lib/trips";
import { SearchInput } from "@/components/ui/SearchInput";
import { TripsPageMenu } from "@/components/trips/TripsPageMenu";
import { surfaceCard, surfaceCardLinkHover } from "@/lib/screen-styles";

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

  return (
    <>
      <header className="mb-8 pt-1">
        {archived ? (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Trips</p>
            <h1 className="mt-2 text-[30px] font-bold leading-[1.08] tracking-[-0.035em] text-white sm:text-[34px]">
              Archived
            </h1>
            <p className="mt-3 max-w-[340px] text-[15px] leading-relaxed text-white/48">
              Completed journeys — they stay here and count toward your Stats.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-[30px] font-bold leading-[1.08] tracking-[-0.035em] text-white sm:text-[34px]">
              Trips
            </h1>
            <p className="mt-3 max-w-[360px] text-[15px] leading-relaxed text-white/48">
              Every journey in one place. Search below, add a trip with +, or open Archived from the menu.
            </p>
          </>
        )}
      </header>

      <div className="mb-8 flex flex-row items-center gap-2.5">
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
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.06] text-white transition-colors hover:border-white/[0.18] hover:bg-white/[0.1] active:scale-[0.98]"
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
        <ul className="flex flex-col gap-4 sm:gap-5">
          {filtered.map((trip) => {
            const statusDisplay = archived ? "COMPLETED" : trip.status.toUpperCase();
            const statusClass = archived
              ? "border border-white/[0.1] bg-white/[0.06] text-white/55"
              : trip.status === "Active"
                ? "border border-emerald-500/25 bg-emerald-500/[0.14] text-emerald-300"
                : trip.status === "Upcoming"
                  ? "border border-amber-500/20 bg-amber-500/[0.12] text-amber-200/95"
                  : "border border-white/[0.08] bg-white/[0.06] text-white/48";

            return (
              <li key={trip.id}>
                <Link
                  href={`/trips/${trip.slug}`}
                  className="group relative block overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0A0A0A] p-7 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:border-white/[0.15] hover:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_0_0_1px_rgba(255,255,255,0.04),0_16px_48px_rgba(0,0,0,0.55)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303]"
                >
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-90"
                    aria-hidden
                  />
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-[21px] font-bold leading-[1.2] tracking-[-0.03em] text-white sm:text-[22px]">
                        {trip.title}
                      </h2>
                      <p className="mt-2.5 text-[12px] font-medium leading-relaxed tracking-wide text-white/42">
                        {trip.dates}
                        {trip.travelers ? ` · ${trip.travelers}` : null}
                      </p>
                      {trip.destination?.trim() ? (
                        <p className="mt-1.5 text-[12px] leading-snug text-white/28">{trip.destination.trim()}</p>
                      ) : null}
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] ${statusClass}`}
                    >
                      {statusDisplay}
                    </span>
                  </div>
                  {trip.next_action_title?.trim() && !archived ? (
                    <p className="relative mt-5 border-t border-white/[0.06] pt-4 text-[13px] leading-relaxed text-white/45">
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
