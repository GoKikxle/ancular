"use client";

import { useId } from "react";
import Link from "next/link";
import type { DbTrip } from "@/lib/trips";
import {
  daysUntil,
  formatCardDate,
  formatCity,
  formatRowDate,
} from "@/lib/trip-list-formatting";

function PatternPanel({ word }: { word: string }) {
  const id = useId().replace(/:/g, "p");
  const w = 110;
  const h = 42;
  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={id} x="0" y="0" width={w} height={h} patternUnits="userSpaceOnUse">
          <text
            x="4"
            y="30"
            fontSize="21"
            fontWeight="900"
            fill="rgba(255,255,255,0.065)"
            fontFamily="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
            letterSpacing="-0.5"
          >
            {word}
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export function ActiveTripCard({ trip }: { trip: DbTrip }) {
  const cityLabel = formatCity(trip.destination, trip.title);
  const date = formatCardDate(trip.start_date, trip.end_date);
  const patternWord = (trip.destination ?? trip.title).split(",")[0].toUpperCase().trim();

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="block rounded-[20px] bg-[#0A0A0A] p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF00]/40"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <p
        className="break-words text-[36px] font-black leading-[0.9] tracking-[-0.03em]"
        style={{ color: "#D4FF00" }}
      >
        {cityLabel}
      </p>

      <p className="mt-[10px] text-[10px] font-bold uppercase tracking-[0.24em] text-white/50">
        {trip.title.toUpperCase()}
      </p>

      <div
        className="mt-[14px] w-full overflow-hidden rounded-[12px]"
        style={{ height: "150px", background: "#161616" }}
        aria-hidden
      >
        <PatternPanel word={patternWord} />
      </div>

      <div className="mt-[14px] flex items-center justify-between">
        <p
          className="text-[12px] font-medium tracking-[0.01em]"
          style={{ color: "rgba(255,255,255,0.42)" }}
        >
          {date}
        </p>

        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="9.5" stroke="#D4FF00" strokeWidth="1.3" />
          <circle cx="11" cy="11" r="5.5" stroke="#D4FF00" strokeWidth="1.1" opacity="0.5" />
          <circle cx="11" cy="11" r="2.2" fill="#D4FF00" />
        </svg>
      </div>
    </Link>
  );
}

export function UpcomingTripRow({ trip }: { trip: DbTrip }) {
  const cityLabel = formatCity(trip.destination, trip.title);
  const dateLabel = formatRowDate(trip.start_date, trip.end_date);
  const days = daysUntil(trip.start_date);
  const countdown = String(days).padStart(2, "0");

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="flex h-[76px] items-center gap-[14px] rounded-[16px] border border-[#EBEBEB] bg-white px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:border-white/[0.08] dark:bg-white/[0.04]"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div
        className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#D0D0D0] bg-[#FAFAFA] dark:border-white/[0.18] dark:bg-white/[0.06]"
        aria-hidden
      >
        <span className="text-[15px] font-bold leading-none tabular-nums text-[#4A4A4A] dark:text-white/65">
          {countdown}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-bold leading-tight tracking-[-0.02em] text-[#111111] dark:text-white">
          {cityLabel}
        </p>
        <p className="mt-[3px] truncate text-[12px] leading-snug text-[#9A9A9A] dark:text-white/45">
          {trip.title}
        </p>
      </div>

      <p className="shrink-0 text-right text-[12px] font-normal text-[#AAAAAA] dark:text-white/38">
        {dateLabel}
      </p>
    </Link>
  );
}
