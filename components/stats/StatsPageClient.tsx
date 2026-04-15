"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import TravelMap, { type TravelMapPoint } from "@/components/TravelMap";
import type { UserStats } from "@/lib/stats";
import { buildYearlyTravelNarrative } from "@/lib/yearly-travel-story";
import { surfaceCardLight } from "@/lib/screen-styles";
import { CountUp } from "./CountUp";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

function FadeUp({
  delay = 0,
  className = "",
  children,
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: EASE, delay: reduceMotion ? 0 : delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AccentBar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="h-[3px] overflow-hidden rounded-full bg-[#EBEBEB] dark:bg-white/[0.1]">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-600"
        initial={reduceMotion ? { width: `${pct}%` } : { width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{
          duration: reduceMotion ? 0 : 1.0,
          ease: [0.25, 0.46, 0.45, 1],
          delay,
        }}
      />
    </div>
  );
}

// ─── EMPTY STATE ────────────────────────────────────────────────────────────

function EmptyState({ mapPoints }: { mapPoints: TravelMapPoint[] }) {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute left-0 top-0 h-[220px] w-[280px] opacity-40 dark:opacity-25">
        <div
          className="h-full w-full"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 18% 28%, rgba(14,165,233,0.14) 0%, transparent 65%)",
          }}
        />
      </div>

      <div className="relative z-10 px-5 pt-[22px]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="flex items-center gap-2"
        >
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden className="text-sky-500">
            <circle cx="7" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M7 13C7 13 2 8.5 2 5.5a5 5 0 0 1 10 0C12 8.5 7 13 7 13Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#AAAAAA] dark:text-white/40">
            Stats
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.62, ease: EASE, delay: 0.1 }}
          className="mt-6 max-w-[300px] text-[28px] font-bold leading-[1.12] tracking-[-0.03em] text-[#111111] dark:text-white sm:text-[32px]"
        >
          Your travel story
          <br />
          starts here.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.25 }}
          className="mt-5 max-w-[280px] text-[13px] leading-relaxed text-[#9A9A9A] dark:text-white/45"
        >
          Complete a trip and this page becomes your personal travel record.
        </motion.p>
      </div>

      <div className="relative z-10 mt-8 px-5">
        <div className="flex flex-wrap items-baseline gap-x-1 gap-y-2">
          {(["Places", "Countries", "Days"] as const).map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.34 + i * 0.1 }}
              className="flex items-baseline"
            >
              {i > 0 && (
                <span className="mx-2 text-[12px] font-light text-[#D0D0D0] dark:text-white/15 sm:mx-3.5">
                  /
                </span>
              )}
              <div>
                <span className="text-[15px] font-semibold tabular-nums tracking-[-0.02em] text-[#BBBBBB] dark:text-white/25">
                  —
                </span>
                <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9A9A9A] dark:text-white/40">
                  {item}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.42 }}
        className="relative z-10 mt-8 px-5"
      >
        <Link
          href="/trips"
          className={`group inline-flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white px-4 py-3 text-[14px] font-semibold text-[#111111] shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-colors hover:border-[#D8D8D8] hover:bg-[#FAFAFA] dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white dark:shadow-none dark:hover:bg-white/[0.1]`}
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/10 text-sky-600 dark:border-sky-400/30 dark:bg-sky-400/15 dark:text-sky-300">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M2.5 6h7M6.5 3l3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Go to Trips
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.72 }}
        className="px-5 pb-28 pt-8"
      >
        <div className={`${surfaceCardLight} space-y-3 px-5 py-5`}>
          {[
            "Places, countries and days traveled",
            "Your yearly travel story",
            "Progress across milestones",
            "Flights and restaurants logged",
          ].map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE, delay: 0.9 + i * 0.06 }}
              className="flex gap-3"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500/70 dark:bg-sky-400/80" />
              <p className="text-[13px] leading-snug text-[#444444] dark:text-white/70">{line}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── RICH STATE ──────────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  sub,
  large = false,
  delay = 0,
}: {
  label: string;
  value: number | string;
  sub?: string;
  large?: boolean;
  delay?: number;
}) {
  return (
    <FadeUp delay={delay}>
      <div
        className={`h-full rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-[#D6D6D6] dark:border-white/[0.1] dark:bg-white/[0.05] dark:shadow-none dark:hover:border-white/[0.14]`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#AAAAAA] dark:text-white/40">
          {label}
        </p>
        <p
          className={`mt-2.5 font-bold leading-none tracking-[-0.04em] text-[#111111] tabular-nums dark:text-white ${
            large ? "text-[38px]" : "text-[28px]"
          }`}
        >
          {typeof value === "number" ? <CountUp value={value} /> : value}
        </p>
        {sub && (
          <p className="mt-1.5 text-[11px] leading-snug text-[#9A9A9A] dark:text-white/45">{sub}</p>
        )}
      </div>
    </FadeUp>
  );
}

function RichState({ s, mapPoints }: { s: UserStats; mapPoints: TravelMapPoint[] }) {
  const year = new Date().getFullYear();
  const yearlyNarrative = buildYearlyTravelNarrative(s.yearlyTravel);
  const tripDelta = s.completedTripsThisYear - s.completedTripsLastYear;

  const placesPct = Math.min(100, Math.round((s.placesVisited / 10) * 100));
  const countriesPct = Math.min(100, Math.round((s.countriesVisited / 20) * 100));
  const daysPct = Math.min(100, Math.round((s.daysTraveled / 50) * 100));

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-5 pb-28 pt-[22px]">
      <FadeUp delay={0}>
        <div
          className={`relative overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white px-7 pb-8 pt-9 text-center shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:border-white/[0.1] dark:bg-white/[0.05] dark:shadow-none`}
        >
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-44 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full dark:opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(14,165,233,0.12) 0%, transparent 68%)",
            }}
          />
          <p className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#AAAAAA] dark:text-white/40">
            Travel footprint
          </p>
          <p className="relative z-10 mt-3 text-[56px] font-bold leading-none tracking-[-0.05em] text-[#111111] tabular-nums dark:text-white sm:text-[64px]">
            <CountUp value={s.placesVisited} />
          </p>
          <p className="relative z-10 mt-2 text-[15px] font-medium text-[#666666] dark:text-white/55">
            {s.placesVisited === 1 ? "place visited" : "places visited"}
          </p>
          {s.countriesVisited > 0 && (
            <p className="relative z-10 mt-1 text-[13px] text-[#9A9A9A] dark:text-white/45">
              across {s.countriesVisited} {s.countriesVisited === 1 ? "country" : "countries"}
            </p>
          )}
        </div>
      </FadeUp>

      <div className="mt-6">
        <TravelMap
          points={mapPoints}
          heading={{ eyebrow: "Travel map", title: "Your destinations", titleId: "travel-map-heading" }}
        />
      </div>

      <div className="mt-3 grid grid-cols-5 gap-3">
        <div className="col-span-3">
          <StatTile
            label="Days traveled"
            value={s.daysTraveled}
            sub="across all trips"
            large
            delay={0.08}
          />
        </div>
        <div className="col-span-2">
          <StatTile label="Countries" value={s.countriesVisited} large delay={0.12} />
        </div>
        <div className="col-span-5">
          <FadeUp delay={0.16}>
            <div
              className={`rounded-2xl border border-[#EBEBEB] bg-white px-5 py-4 shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:border-white/[0.1] dark:bg-white/[0.05] dark:shadow-none`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#AAAAAA] dark:text-white/40">
                Completed trips
              </p>
              <div className="mt-2.5 flex items-end gap-4">
                <p className="text-[38px] font-bold leading-none tracking-[-0.04em] text-[#111111] tabular-nums dark:text-white">
                  <CountUp value={s.completedTripCount} />
                </p>
                {s.completedTripsThisYear > 0 && (
                  <div className="mb-1 flex flex-col gap-0.5">
                    <p className="text-[12px] text-[#9A9A9A] dark:text-white/45">
                      <span className="font-medium text-[#111111] dark:text-white/70">
                        {s.completedTripsThisYear}
                      </span>{" "}
                      in {year}
                    </p>
                    {s.completedTripsLastYear > 0 && (
                      <p className="text-[11px] text-[#AAAAAA] dark:text-white/35">
                        {tripDelta >= 0 ? "+" : ""}
                        {tripDelta} vs {year - 1}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>

      {(s.averageTripLengthDays > 0 ||
        s.longestTripDays > 0 ||
        s.flights > 0 ||
        s.restaurants > 0 ||
        s.favoritePlaceVisited) && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {s.averageTripLengthDays > 0 && (
            <FadeUp delay={0.2} className="flex-shrink-0">
              <div className="w-[112px] rounded-2xl border border-[#EBEBEB] bg-white p-4 dark:border-white/[0.1] dark:bg-white/[0.05]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#AAAAAA] dark:text-white/38">
                  Avg trip
                </p>
                <p className="mt-2 text-[22px] font-bold leading-none tracking-[-0.03em] text-[#111111] dark:text-white">
                  {s.averageTripLengthDays}
                  <span className="ml-0.5 text-[14px] font-medium text-[#9A9A9A] dark:text-white/45">
                    d
                  </span>
                </p>
              </div>
            </FadeUp>
          )}
          {s.longestTripDays > 0 && (
            <FadeUp delay={0.23} className="flex-shrink-0">
              <div className="w-[112px] rounded-2xl border border-[#EBEBEB] bg-white p-4 dark:border-white/[0.1] dark:bg-white/[0.05]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#AAAAAA] dark:text-white/38">
                  Longest
                </p>
                <p className="mt-2 text-[22px] font-bold leading-none tracking-[-0.03em] text-[#111111] dark:text-white">
                  {s.longestTripDays}
                  <span className="ml-0.5 text-[14px] font-medium text-[#9A9A9A] dark:text-white/45">
                    d
                  </span>
                </p>
              </div>
            </FadeUp>
          )}
          {s.flights > 0 && (
            <FadeUp delay={0.26} className="flex-shrink-0">
              <div className="w-[112px] rounded-2xl border border-[#EBEBEB] bg-white p-4 dark:border-white/[0.1] dark:bg-white/[0.05]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#AAAAAA] dark:text-white/38">
                  Flights
                </p>
                <p className="mt-2 text-[22px] font-bold leading-none tracking-[-0.03em] text-[#111111] tabular-nums dark:text-white">
                  {s.flights}
                </p>
              </div>
            </FadeUp>
          )}
          {s.restaurants > 0 && (
            <FadeUp delay={0.29} className="flex-shrink-0">
              <div className="w-[112px] rounded-2xl border border-[#EBEBEB] bg-white p-4 dark:border-white/[0.1] dark:bg-white/[0.05]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#AAAAAA] dark:text-white/38">
                  Restaurants
                </p>
                <p className="mt-2 text-[22px] font-bold leading-none tracking-[-0.03em] text-[#111111] tabular-nums dark:text-white">
                  {s.restaurants}
                </p>
              </div>
            </FadeUp>
          )}
          {s.favoritePlaceVisited && (
            <FadeUp delay={0.32} className="flex-shrink-0">
              <div className="w-[140px] rounded-2xl border border-[#EBEBEB] bg-white p-4 dark:border-white/[0.1] dark:bg-white/[0.05]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#AAAAAA] dark:text-white/38">
                  Favorite
                </p>
                <p className="mt-2 truncate text-[15px] font-semibold leading-snug tracking-[-0.02em] text-[#111111] dark:text-white">
                  {s.favoritePlaceVisited}
                </p>
              </div>
            </FadeUp>
          )}
        </div>
      )}

      <FadeUp delay={0.22} className="mt-3">
        <div
          className={`rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:border-white/[0.1] dark:bg-white/[0.05] dark:shadow-none`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#AAAAAA] dark:text-white/40">
            {year} story
          </p>
          <p className="mt-3.5 text-[16px] font-medium leading-relaxed tracking-[-0.015em] text-[#111111] dark:text-white/85">
            {yearlyNarrative}
          </p>

          {(s.placesVisited > 0 || s.countriesVisited > 0 || s.daysTraveled > 0) && (
            <div className="mt-6 space-y-4">
              {s.placesVisited > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[11px] text-[#666666] dark:text-white/45">
                      <span className="font-semibold text-sky-600 dark:text-sky-400">{s.placesVisited}</span>{" "}
                      / 10 places
                    </span>
                    <span className="text-[10px] text-[#AAAAAA] dark:text-white/30">milestone</span>
                  </div>
                  <AccentBar pct={placesPct} delay={0.45} />
                </div>
              )}
              {s.countriesVisited > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[11px] text-[#666666] dark:text-white/45">
                      <span className="font-semibold text-sky-600 dark:text-sky-400">
                        {s.countriesVisited}
                      </span>{" "}
                      / 20 countries
                    </span>
                    <span className="text-[10px] text-[#AAAAAA] dark:text-white/30">milestone</span>
                  </div>
                  <AccentBar pct={countriesPct} delay={0.55} />
                </div>
              )}
              {s.daysTraveled > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[11px] text-[#666666] dark:text-white/45">
                      <span className="font-semibold text-sky-600 dark:text-sky-400">{s.daysTraveled}</span>{" "}
                      / 50 days
                    </span>
                    <span className="text-[10px] text-[#AAAAAA] dark:text-white/30">milestone</span>
                  </div>
                  <AccentBar pct={daysPct} delay={0.65} />
                </div>
              )}
            </div>
          )}

          {s.yearlyTravel.favoriteDestination && (
            <div className="mt-5 flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-500 dark:bg-sky-400" />
              <p className="text-[12px] text-[#9A9A9A] dark:text-white/45">
                Favorite this year ·{" "}
                <span className="font-medium text-[#444444] dark:text-white/70">
                  {s.yearlyTravel.favoriteDestination}
                </span>
              </p>
            </div>
          )}
        </div>
      </FadeUp>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

type Props = { stats: UserStats; mapPoints: TravelMapPoint[] };

export function StatsPageClient({ stats: s, mapPoints }: Props) {
  if (s.completedTripCount === 0) {
    return <EmptyState mapPoints={mapPoints} />;
  }
  return <RichState s={s} mapPoints={mapPoints} />;
}
