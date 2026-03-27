"use client";

import Link from "next/link";
import type { DbTrip } from "@/lib/trips";

type Props = {
  trips: DbTrip[];
};

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TripsSummaryHero({ trips }: Props) {
  if (trips.length === 0) return null;

  const total = trips.length;
  const activeCount = trips.filter((t) => t.status === "Active").length;
  const upcomingCount = trips.filter((t) => t.status === "Upcoming").length;

  const featured =
    trips.find((t) => t.status === "Active") ??
    trips.find((t) => t.status === "Upcoming") ??
    trips[0];

  const dest =
    featured?.destination?.trim() ||
    trips.find((t) => t.destination?.trim())?.destination?.trim() ||
    null;

  const headline = total === 1 ? "1 trip planned" : `${total} trips planned`;

  const supportParts: string[] = [];
  if (activeCount > 0) {
    supportParts.push(
      activeCount === 1 ? "1 active journey right now" : `${activeCount} active journeys right now`
    );
  } else if (upcomingCount > 0) {
    supportParts.push(
      upcomingCount === 1 ? "1 upcoming on your calendar" : `${upcomingCount} upcoming on your calendar`
    );
  }
  if (dest) {
    supportParts.push(`Next stop: ${dest}`);
  }
  const supporting =
    supportParts.length > 0
      ? supportParts.join(" · ")
      : "Open a trip below to review details and next steps.";

  return (
    <Link
      href={`/trips/${featured.slug}`}
      className="group relative mb-8 block overflow-hidden rounded-3xl border border-amber-950/[0.12] bg-gradient-to-br from-[#F8D54E] via-[#F2C429] to-[#E5AE16] p-7 shadow-[0_14px_44px_rgba(0,0,0,0.38)] transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.01] hover:shadow-[0_18px_52px_rgba(0,0,0,0.42)] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303] sm:p-8"
    >
      <span
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/30 blur-2xl"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-0 left-0 h-24 w-48 bg-gradient-to-tr from-amber-950/[0.06] to-transparent"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-5">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-900/50">
            Your journeys
          </p>
          <p className="mt-3 text-[22px] font-bold leading-[1.12] tracking-[-0.035em] text-neutral-950 sm:text-[25px]">
            {headline}
          </p>
          <p className="mt-2.5 max-w-[340px] text-[14px] leading-relaxed text-neutral-900/75">
            {supporting}
          </p>
        </div>
        <ChevronIcon className="mt-1 shrink-0 text-neutral-950/30 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-neutral-950/50" />
      </div>
    </Link>
  );
}
