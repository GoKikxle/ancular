"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import type { DbTrip } from "@/lib/trips";
import { TripsPageMenu } from "@/components/trips/TripsPageMenu";
import { useTheme } from "@/components/providers/ThemeProvider";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const COUNTRY_ABBR: Record<string, string> = {
  "nigeria": "NGA", "niger": "NER",
  "united states": "USA", "united states of america": "USA", "us": "USA", "usa": "USA",
  "united kingdom": "GBR", "uk": "GBR", "england": "ENG", "scotland": "SCO",
  "france": "FRA", "germany": "DEU", "italy": "ITA", "spain": "ESP",
  "portugal": "PRT", "netherlands": "NLD", "belgium": "BEL", "switzerland": "CHE",
  "austria": "AUT", "sweden": "SWE", "norway": "NOR", "denmark": "DNK",
  "finland": "FIN", "poland": "POL", "czech republic": "CZE", "czechia": "CZE",
  "hungary": "HUN", "romania": "ROU", "greece": "GRC", "turkey": "TUR",
  "russia": "RUS", "ukraine": "UKR", "croatia": "HRV", "serbia": "SRB",
  "japan": "JPN", "china": "CHN", "south korea": "KOR", "korea": "KOR",
  "india": "IND", "thailand": "THA", "vietnam": "VNM", "indonesia": "IDN",
  "malaysia": "MYS", "singapore": "SGP", "philippines": "PHL", "cambodia": "KHM",
  "myanmar": "MMR", "laos": "LAO", "bangladesh": "BGD", "sri lanka": "LKA",
  "nepal": "NPL", "pakistan": "PAK",
  "australia": "AUS", "new zealand": "NZL",
  "south africa": "ZAF", "kenya": "KEN", "ghana": "GHA", "egypt": "EGY",
  "morocco": "MAR", "ethiopia": "ETH", "tanzania": "TZA", "senegal": "SEN",
  "brazil": "BRA", "argentina": "ARG", "colombia": "COL", "peru": "PER",
  "chile": "CHL", "mexico": "MEX", "canada": "CAN",
  "united arab emirates": "UAE", "uae": "UAE",
  "saudi arabia": "SAU", "israel": "ISR", "jordan": "JOR", "lebanon": "LBN",
  "qatar": "QAT", "kuwait": "KWT", "bahrain": "BHR", "oman": "OMN",
  "cuba": "CUB", "jamaica": "JAM", "iceland": "ISL", "ireland": "IRL",
  "malta": "MLT", "luxembourg": "LUX",
};

function formatCity(destination: string | null | undefined, title: string): string {
  const dest = destination?.trim();
  if (!dest) return title.toUpperCase();
  const parts = dest.split(",").map((s) => s.trim()).filter(Boolean);
  const city = parts[0].toUpperCase();
  if (parts.length === 1) return `${city}.`;
  const rawCountry = parts[parts.length - 1].toLowerCase();
  const abbr = COUNTRY_ABBR[rawCountry] ?? rawCountry.slice(0, 3).toUpperCase();
  return `${city}, ${abbr}.`;
}

function formatCardDate(start: string | null, end: string | null): string {
  if (!start) return "";
  const parse = (iso: string) => new Date(`${iso}T12:00:00`);
  const fmtPart = (d: Date) => {
    const day = String(d.getDate()).padStart(2, "0");
    const mon = d.toLocaleDateString("en-US", { month: "short" });
    return `${day} ${mon}`;
  };
  const s = parse(start);
  if (!end) return `${fmtPart(s)}, ${s.getFullYear()}`;
  const e = parse(end);
  return `${fmtPart(s)} - ${fmtPart(e)}, ${e.getFullYear()}`;
}

function formatRowDate(start: string | null, end: string | null): string {
  if (!start) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(`${start}T00:00:00`);
  const diffDays = Math.ceil((startDate.getTime() - today.getTime()) / 86400000);

  if (diffDays >= 0 && diffDays <= 6) {
    return startDate.toLocaleDateString("en-US", { weekday: "short" });
  }
  const day = String(startDate.getDate()).padStart(2, "0");
  const mon = startDate.toLocaleDateString("en-US", { month: "short" });
  return `${day} ${mon}`;
}

function daysUntil(startDate: string | null): number {
  if (!startDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(`${startDate}T00:00:00`);
  return Math.max(0, Math.ceil((start.getTime() - today.getTime()) / 86400000));
}

function filterTrips(trips: DbTrip[], query: string): DbTrip[] {
  const s = query.trim().toLowerCase();
  if (!s) return trips;
  return trips.filter(
    (t) =>
      t.title.toLowerCase().includes(s) ||
      (t.destination ?? "").toLowerCase().includes(s)
  );
}

// ─── PATTERN PANEL ────────────────────────────────────────────────────────────

function PatternPanel({ word }: { word: string }) {
  const id = useId().replace(/:/g, "p");
  const w = 110;
  const h = 42;
  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id={id}
          x="0"
          y="0"
          width={w}
          height={h}
          patternUnits="userSpaceOnUse"
        >
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

// ─── ACTIVE TRIP CARD (always editorial dark — intentional design) ─────────────

function ActiveTripCard({ trip }: { trip: DbTrip }) {
  const cityLabel = formatCity(trip.destination, trip.title);
  const date = formatCardDate(trip.start_date, trip.end_date);
  const patternWord = (trip.destination ?? trip.title)
    .split(",")[0]
    .toUpperCase()
    .trim();

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="block rounded-[20px] bg-[#0A0A0A] p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF00]/40"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <p
        className="text-[36px] font-black leading-[0.9] tracking-[-0.03em] break-words"
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

// ─── UPCOMING TRIP ROW ────────────────────────────────────────────────────────

function UpcomingTripRow({ trip }: { trip: DbTrip }) {
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

// ─── SEARCH BAR ───────────────────────────────────────────────────────────────

function SearchBar({
  value,
  onChange,
  placeholder = "Search",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="sr-only">
        Search trips
      </label>
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#BBBBBB] dark:text-white/30"
          aria-hidden
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </span>
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          className="h-12 w-full rounded-[12px] border border-[#E5E5E5] bg-white py-0 pl-[38px] pr-3 text-[14px] text-[#111111] placeholder:text-[#BBBBBB] focus:border-[#D0D0D0] focus:outline-none dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/[0.18]"
        />
      </div>
    </div>
  );
}

// ─── ICON HELPERS ─────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// ─── ACTIVE TRIPS VIEW ────────────────────────────────────────────────────────

function ActiveTripsView({
  allTrips,
  filtered,
  noMatches,
  q,
  setQ,
}: {
  allTrips: DbTrip[];
  filtered: DbTrip[];
  noMatches: boolean;
  q: string;
  setQ: (v: string) => void;
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const activeTrip =
    filtered.find((t) => t.status === "Active") ??
    filtered.find((t) => t.status === "Upcoming") ??
    (filtered.length > 0 ? filtered[0] : null);

  const listTrips = activeTrip
    ? filtered.filter((t) => t.id !== activeTrip.id)
    : filtered;

  return (
    <div className="flex flex-col bg-[#F8F8F8] dark:bg-neutral-950">
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 pt-[22px] pb-[10px]">
        <h1 className="text-[24px] font-bold tracking-[-0.03em] text-[#111111] dark:text-white">
          Trips
        </h1>
        <div className="h-10 w-10" aria-hidden />
      </div>

      {/* SEARCH ROW */}
      <div className="flex items-center gap-[8px] px-5 pb-[16px] pt-[4px]">
        {allTrips.length > 0 ? (
          <SearchBar value={q} onChange={setQ} />
        ) : (
          <div className="min-w-0 flex-1" aria-hidden />
        )}
        <Link
          href="/trips/new"
          aria-label="New trip"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] border border-[#E5E5E5] bg-white text-[#666666] active:scale-[0.96] dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white/65"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <PlusIcon />
        </Link>
        <div className="shrink-0">
          <TripsPageMenu light={isLight} />
        </div>
      </div>

      {/* CONTENT */}
      {allTrips.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-5 pb-24">
          <p className="text-[18px] font-bold text-[#111111] dark:text-white">No trips yet</p>
          <p className="mx-auto mt-2 max-w-[240px] text-center text-[13px] leading-relaxed text-[#999999] dark:text-white/40">
            Create your first trip to start planning.
          </p>
          <Link
            href="/trips/new"
            className="mt-8 inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#111111] px-6 text-[14px] font-semibold text-white active:scale-[0.98] dark:bg-white dark:text-neutral-950"
          >
            Create a trip
          </Link>
        </div>
      ) : noMatches ? (
        <div className="flex flex-1 items-center justify-center pb-24">
          <p className="text-[14px] text-[#AAAAAA] dark:text-white/38">No matching trips</p>
        </div>
      ) : (
        <div className="flex flex-col gap-[10px] px-5 pb-10">
          {activeTrip && <ActiveTripCard trip={activeTrip} />}
          {listTrips.map((trip) => (
            <UpcomingTripRow key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ARCHIVED VIEW ─────────────────────────────────────────────────────────────

const DARK_PALETTE = [
  { bg: "#DEDCD6", fg: "#0D0D0D", sub: "rgba(13,13,13,0.52)" },
  { bg: "#F5D86A", fg: "#0D0D0D", sub: "rgba(13,13,13,0.52)" },
  { bg: "#F28048", fg: "#0D0D0D", sub: "rgba(13,13,13,0.52)" },
  { bg: "#E04242", fg: "#FFFFFF", sub: "rgba(255,255,255,0.58)" },
  { bg: "#F0A0B2", fg: "#0D0D0D", sub: "rgba(13,13,13,0.52)" },
  { bg: "#ACA0CC", fg: "#0D0D0D", sub: "rgba(13,13,13,0.52)" },
  { bg: "#6EC49C", fg: "#0D0D0D", sub: "rgba(13,13,13,0.52)" },
  { bg: "#4878D8", fg: "#FFFFFF", sub: "rgba(255,255,255,0.58)" },
] as const;

function ArchivedTripBlock({ trip, index }: { trip: DbTrip; index: number }) {
  const { bg, fg, sub } = DARK_PALETTE[index % DARK_PALETTE.length];
  const cityLabel = formatCity(trip.destination, trip.title);
  const date = formatCardDate(trip.start_date, trip.end_date);
  const hasDestination = !!(trip.destination?.trim());

  return (
    <li>
      <Link
        href={`/trips/${trip.slug}`}
        className="block w-full px-5 py-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-inset active:opacity-90"
        style={{ background: bg }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p
              className="break-words text-[34px] font-black leading-[0.95] tracking-[-0.03em]"
              style={{ color: fg }}
            >
              {cityLabel}
            </p>
            {hasDestination && (
              <p
                className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: sub }}
              >
                {trip.title.toUpperCase()}
              </p>
            )}
            {date && (
              <p
                className="mt-1.5 text-[11px] font-medium"
                style={{ color: sub }}
              >
                {date}
              </p>
            )}
          </div>
          <span
            className="mt-1.5 block h-2 w-2 shrink-0 rounded-full"
            style={{
              background:
                fg === "#FFFFFF"
                  ? "rgba(255,255,255,0.35)"
                  : "rgba(13,13,13,0.25)",
            }}
            aria-hidden
          />
        </div>
      </Link>
    </li>
  );
}

function ArchivedTripsView({
  allTrips,
  filtered,
  noMatches,
  q,
  setQ,
}: {
  allTrips: DbTrip[];
  filtered: DbTrip[];
  noMatches: boolean;
  q: string;
  setQ: (v: string) => void;
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="flex flex-col">
      <div className="px-5 pb-1 pt-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#AAAAAA] dark:text-white/38">
          Trips
        </p>
        <h1 className="mt-1 text-[28px] font-black tracking-[-0.04em] text-[#111111] dark:text-white">
          Archived
        </h1>
      </div>

      <div className="flex items-center gap-2 px-5 py-4">
        {allTrips.length > 0 ? (
          <SearchBar value={q} onChange={setQ} placeholder="Search archived" />
        ) : (
          <div className="min-w-0 flex-1" aria-hidden />
        )}
        <Link
          href="/trips/new"
          aria-label="New trip"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] border border-[#E5E5E5] bg-white text-[#666666] active:scale-[0.96] dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white/65"
        >
          <PlusIcon />
        </Link>
        <TripsPageMenu light={isLight} />
      </div>

      {allTrips.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <p className="text-[16px] font-semibold text-[#111111] dark:text-white/70">
            No archived trips yet
          </p>
          <p className="mx-auto mt-2 max-w-[280px] text-[13px] leading-relaxed text-[#9A9A9A] dark:text-white/38">
            When you mark a trip as completed, it will show up here and in your
            Stats.
          </p>
        </div>
      ) : noMatches ? (
        <div className="px-5 py-12 text-center">
          <p className="text-[15px] text-[#AAAAAA] dark:text-white/55">No matching trips</p>
        </div>
      ) : (
        <ul className="flex flex-col">
          {filtered.map((trip, index) => (
            <ArchivedTripBlock key={trip.id} trip={trip} index={index} />
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

type Props = {
  trips: DbTrip[];
  variant?: "active" | "archived";
};

export function TripsIndexClient({ trips, variant = "active" }: Props) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => filterTrips(trips, q), [trips, q]);
  const searching = q.trim().length > 0;
  const noMatches = searching && filtered.length === 0;

  if (variant === "archived") {
    return (
      <ArchivedTripsView
        allTrips={trips}
        filtered={filtered}
        noMatches={noMatches}
        q={q}
        setQ={setQ}
      />
    );
  }

  return (
    <ActiveTripsView
      allTrips={trips}
      filtered={filtered}
      noMatches={noMatches}
      q={q}
      setQ={setQ}
    />
  );
}
