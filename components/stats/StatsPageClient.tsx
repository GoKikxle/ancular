"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { UserStats } from "@/lib/stats";
import { buildYearlyTravelNarrative } from "@/lib/yearly-travel-story";
import { CountUp } from "./CountUp";
import { StatsWorldMap } from "@/components/stats/StatsWorldMap";

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

function AmberBar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="h-[2px] overflow-hidden rounded-full bg-white/[0.07]">
      <motion.div
        className="h-full rounded-full"
        style={{ background: "linear-gradient(90deg, #FFB800, #E07000)" }}
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

function EmptyState() {
  return (
    <div
      className="relative w-full"
      style={{ background: "linear-gradient(170deg, #0A0A0A 0%, #0D0D10 100%)" }}
    >
      {/* Ambient amber glow — top-left, behind headline */}
      <motion.div
        className="pointer-events-none absolute left-0 top-0 h-[300px] w-[360px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.12, 0.06, 0.15, 0.06] }}
        transition={{ duration: 4, ease: "easeInOut", delay: 0.4, repeat: Infinity, repeatType: "mirror" }}
        style={{
          background: "radial-gradient(ellipse 70% 55% at 18% 32%, rgba(255,184,0,1) 0%, transparent 65%)",
        }}
      />

      {/* HERO */}
      <div className="relative z-10 px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="flex items-center gap-2"
        >
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.55 }}>
            <circle cx="7" cy="5.5" r="2" stroke="#FFB800" strokeWidth="1.3" />
            <path d="M7 13C7 13 2 8.5 2 5.5a5 5 0 0 1 10 0C12 8.5 7 13 7 13Z" stroke="#FFB800" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/28">Stats</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.62, ease: EASE, delay: 0.1 }}
          className="mt-6 max-w-[300px] text-[34px] font-bold leading-[1.1] tracking-[-0.035em] text-white"
        >
          Your travel story<br />starts here.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.25 }}
          className="mt-5 max-w-[240px] text-[13px] leading-relaxed text-white/35"
        >
          Complete a trip and this page becomes your personal travel record.
        </motion.p>
      </div>

      {/* PREVIEW METRICS */}
      <div className="relative z-10 mt-10 px-6">
        <div className="flex items-baseline">
          {([
            { label: "Places",    delay: 0.34 },
            { label: "Countries", delay: 0.44 },
            { label: "Days",      delay: 0.54 },
          ] as const).map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE, delay: item.delay }}
              className="flex items-baseline"
            >
              {i > 0 && <span className="mx-3.5 text-[13px] text-white/[0.1]">/</span>}
              <div>
                <span className="text-[15px] font-bold tracking-[-0.02em] text-white/18">—</span>
                <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.13em] text-white/22">{item.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.42 }}
        className="relative z-10 mt-10 px-6"
      >
        <motion.div whileTap={{ scale: 0.96 }} className="inline-flex">
          <Link
            href="/trips"
            className="group inline-flex items-center gap-2.5 text-[14px] font-medium text-white/55 transition-colors duration-150 hover:text-white/90"
          >
            <motion.span
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(255,184,0,0.10)", border: "1px solid rgba(255,184,0,0.22)" }}
              whileHover={{ background: "rgba(255,184,0,0.24)", borderColor: "rgba(255,184,0,0.5)", boxShadow: "0 0 18px rgba(255,184,0,0.2)" }}
              transition={{ duration: 0.14, ease: "easeOut" }}
            >
              <motion.svg width="11" height="11" viewBox="0 0 12 12" fill="none" whileHover={{ x: 3 }} transition={{ duration: 0.14, ease: "easeOut" }}>
                <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="#FFB800" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </motion.span>
            <motion.span whileHover={{ x: 1 }} transition={{ duration: 0.14, ease: "easeOut" }}>
              Go to Trips
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>

      {/* MAP — in-flow section, below CTA, no card wrapper */}
      <motion.div
        className="relative mt-12 w-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: EASE, delay: 0.55 }}
      >
        {/* Top fade — dissolves map edge into page */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-10"
          style={{
            height: "72px",
            background: "linear-gradient(to bottom, #0A0A0A 0%, transparent 100%)",
          }}
        />
        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-10"
          style={{
            height: "56px",
            background: "linear-gradient(to top, #0D0D10 0%, transparent 100%)",
          }}
        />
        <StatsWorldMap />
      </motion.div>

      {/* SUPPORTING COPY */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay: 1.0 }}
        className="px-6 pb-16 pt-6"
      >
        <div className="space-y-2.5">
          {[
            "Places, countries and days traveled",
            "Your yearly travel story",
            "Progress across milestones",
            "Flights and restaurants logged",
          ].map((line, i) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE, delay: 1.05 + i * 0.07 }}
              className="text-[12px] leading-snug text-white/28"
            >
              {line}
            </motion.p>
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
      <div className="h-full rounded-2xl border border-white/[0.07] bg-[#0F0F11] p-5 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset] transition-all duration-200 hover:-translate-y-px hover:border-white/[0.11]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/32">{label}</p>
        <p
          className={`mt-2.5 font-bold leading-none tracking-[-0.04em] text-white tabular-nums ${
            large ? "text-[38px]" : "text-[28px]"
          }`}
        >
          {typeof value === "number" ? <CountUp value={value} /> : value}
        </p>
        {sub && (
          <p className="mt-1.5 text-[11px] leading-snug text-white/30">{sub}</p>
        )}
      </div>
    </FadeUp>
  );
}

function RichState({ s }: { s: UserStats }) {
  const year = new Date().getFullYear();
  const yearlyNarrative = buildYearlyTravelNarrative(s.yearlyTravel);
  const tripDelta = s.completedTripsThisYear - s.completedTripsLastYear;

  const placesPct = Math.min(100, Math.round((s.placesVisited / 10) * 100));
  const countriesPct = Math.min(100, Math.round((s.countriesVisited / 20) * 100));
  const daysPct = Math.min(100, Math.round((s.daysTraveled / 50) * 100));

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-5 pb-10">
      {/* HERO */}
      <FadeUp delay={0}>
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0F0F11] px-7 pb-8 pt-10 text-center">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-48 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, rgba(255,184,0,0.10) 0%, transparent 65%)",
            }}
          />
          <p className="relative z-10 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30">
            Travel footprint
          </p>
          <p className="relative z-10 mt-3 text-[72px] font-bold leading-none tracking-[-0.05em] text-white tabular-nums">
            <CountUp value={s.placesVisited} />
          </p>
          <p className="relative z-10 mt-2 text-[15px] font-medium text-white/50">
            {s.placesVisited === 1 ? "place visited" : "places visited"}
          </p>
          {s.countriesVisited > 0 && (
            <p className="relative z-10 mt-1 text-[13px] text-white/30">
              across {s.countriesVisited} {s.countriesVisited === 1 ? "country" : "countries"}
            </p>
          )}
        </div>
      </FadeUp>

      {/* PRIMARY GRID */}
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
          <StatTile
            label="Countries"
            value={s.countriesVisited}
            large
            delay={0.12}
          />
        </div>
        <div className="col-span-5">
          <FadeUp delay={0.16}>
            <div className="rounded-2xl border border-white/[0.07] bg-[#0F0F11] px-5 py-4 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/32">
                Completed trips
              </p>
              <div className="mt-2.5 flex items-end gap-4">
                <p className="text-[38px] font-bold leading-none tracking-[-0.04em] text-white tabular-nums">
                  <CountUp value={s.completedTripCount} />
                </p>
                {s.completedTripsThisYear > 0 && (
                  <div className="mb-1 flex flex-col gap-0.5">
                    <p className="text-[12px] text-white/38">
                      <span className="text-white/60">{s.completedTripsThisYear}</span>{" "}
                      in {year}
                    </p>
                    {s.completedTripsLastYear > 0 && (
                      <p className="text-[11px] text-white/25">
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

      {/* SECONDARY SCROLL */}
      {(s.averageTripLengthDays > 0 ||
        s.longestTripDays > 0 ||
        s.flights > 0 ||
        s.restaurants > 0 ||
        s.favoritePlaceVisited) && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {s.averageTripLengthDays > 0 && (
            <FadeUp delay={0.2} className="flex-shrink-0">
              <div className="w-[112px] rounded-2xl border border-white/[0.07] bg-[#0F0F11] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/28">Avg trip</p>
                <p className="mt-2 text-[22px] font-bold leading-none tracking-[-0.03em] text-white">
                  {s.averageTripLengthDays}
                  <span className="ml-0.5 text-[14px] font-medium text-white/45">d</span>
                </p>
              </div>
            </FadeUp>
          )}
          {s.longestTripDays > 0 && (
            <FadeUp delay={0.23} className="flex-shrink-0">
              <div className="w-[112px] rounded-2xl border border-white/[0.07] bg-[#0F0F11] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/28">Longest</p>
                <p className="mt-2 text-[22px] font-bold leading-none tracking-[-0.03em] text-white">
                  {s.longestTripDays}
                  <span className="ml-0.5 text-[14px] font-medium text-white/45">d</span>
                </p>
              </div>
            </FadeUp>
          )}
          {s.flights > 0 && (
            <FadeUp delay={0.26} className="flex-shrink-0">
              <div className="w-[112px] rounded-2xl border border-white/[0.07] bg-[#0F0F11] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/28">Flights</p>
                <p className="mt-2 text-[22px] font-bold leading-none tracking-[-0.03em] text-white tabular-nums">
                  {s.flights}
                </p>
              </div>
            </FadeUp>
          )}
          {s.restaurants > 0 && (
            <FadeUp delay={0.29} className="flex-shrink-0">
              <div className="w-[112px] rounded-2xl border border-white/[0.07] bg-[#0F0F11] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/28">Restaurants</p>
                <p className="mt-2 text-[22px] font-bold leading-none tracking-[-0.03em] text-white tabular-nums">
                  {s.restaurants}
                </p>
              </div>
            </FadeUp>
          )}
          {s.favoritePlaceVisited && (
            <FadeUp delay={0.32} className="flex-shrink-0">
              <div className="w-[140px] rounded-2xl border border-white/[0.07] bg-[#0F0F11] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/28">Favorite</p>
                <p className="mt-2 truncate text-[15px] font-semibold leading-snug tracking-[-0.02em] text-white">
                  {s.favoritePlaceVisited}
                </p>
              </div>
            </FadeUp>
          )}
        </div>
      )}

      {/* YEARLY STORY */}
      <FadeUp delay={0.22} className="mt-3">
        <div
          className="rounded-2xl border border-white/[0.06] p-6"
          style={{ background: "linear-gradient(150deg, #0D0D12 0%, #0A0A0E 100%)" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/25">
            {year} story
          </p>
          <p className="mt-3.5 text-[16px] font-medium leading-relaxed tracking-[-0.015em] text-white/80">
            {yearlyNarrative}
          </p>

          {(s.placesVisited > 0 || s.countriesVisited > 0 || s.daysTraveled > 0) && (
            <div className="mt-6 space-y-4">
              {s.placesVisited > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[11px] text-white/35">
                      <span style={{ color: "#FFB800" }} className="font-semibold">
                        {s.placesVisited}
                      </span>{" "}
                      / 10 places
                    </span>
                    <span className="text-[10px] text-white/20">milestone</span>
                  </div>
                  <AmberBar pct={placesPct} delay={0.45} />
                </div>
              )}
              {s.countriesVisited > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[11px] text-white/35">
                      <span style={{ color: "#FFB800" }} className="font-semibold">
                        {s.countriesVisited}
                      </span>{" "}
                      / 20 countries
                    </span>
                    <span className="text-[10px] text-white/20">milestone</span>
                  </div>
                  <AmberBar pct={countriesPct} delay={0.55} />
                </div>
              )}
              {s.daysTraveled > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[11px] text-white/35">
                      <span style={{ color: "#FFB800" }} className="font-semibold">
                        {s.daysTraveled}
                      </span>{" "}
                      / 50 days
                    </span>
                    <span className="text-[10px] text-white/20">milestone</span>
                  </div>
                  <AmberBar pct={daysPct} delay={0.65} />
                </div>
              )}
            </div>
          )}

          {s.yearlyTravel.favoriteDestination && (
            <div className="mt-5 flex items-center gap-2.5">
              <span
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{ background: "#FFB800" }}
              />
              <p className="text-[12px] text-white/35">
                Favorite this year ·{" "}
                <span className="text-white/60">{s.yearlyTravel.favoriteDestination}</span>
              </p>
            </div>
          )}
        </div>
      </FadeUp>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

type Props = { stats: UserStats };

export function StatsPageClient({ stats: s }: Props) {
  if (s.completedTripCount === 0) {
    return <EmptyState />;
  }
  return <RichState s={s} />;
}
