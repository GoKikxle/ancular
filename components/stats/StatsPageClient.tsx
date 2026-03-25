"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { UserStats } from "@/lib/stats";
import { getTravelStory } from "@/lib/travel-story";
import { surfaceCard } from "@/lib/screen-styles";
import { CountUp } from "./CountUp";

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.085, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function primaryPlaceFromDestination(full: string): string {
  const t = full.trim();
  if (!t) return "";
  const first = t.split(",")[0]?.trim() ?? t;
  return first.replace(/\b\w/g, (c) => c.toUpperCase());
}

function MilestoneTrack({
  current,
  target,
  label,
  delay,
}: {
  current: number;
  target: number;
  label: string;
  delay: number;
}) {
  const reduceMotion = useReducedMotion();
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div className="mt-3">
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-white/[0.2]"
          initial={reduceMotion ? { width: `${pct}%` } : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: reduceMotion ? 0 : 0.95,
            ease: [0.25, 0.46, 0.45, 1],
            delay: reduceMotion ? 0 : delay,
          }}
        />
      </div>
      <p className="mt-1.5 text-[10px] font-medium tracking-wide text-white/28">{label}</p>
    </div>
  );
}

function AnimatedStatCard({
  label,
  numericValue,
  textValue,
  subtext,
  milestone,
  barDelay,
}: {
  label: string;
  numericValue?: number;
  textValue?: string;
  subtext: string;
  milestone?: { current: number; target: number; label: string };
  barDelay: number;
}) {
  return (
    <div className={`${surfaceCard} p-6`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{label}</p>
      <p className="mt-3 break-words text-[32px] font-bold leading-tight tracking-[-0.03em] text-white tabular-nums">
        {numericValue !== undefined ? (
          <CountUp value={numericValue} />
        ) : (
          textValue ?? "—"
        )}
      </p>
      <p className="mt-2 text-[12px] leading-snug text-white/38">{subtext}</p>
      {milestone && milestone.target > 0 ? (
        <MilestoneTrack
          current={milestone.current}
          target={milestone.target}
          label={milestone.label}
          delay={barDelay}
        />
      ) : null}
    </div>
  );
}

function buildCopy(s: UserStats): {
  places: string;
  countries: string;
  flights: string;
  restaurants: string;
  days: string;
  last: string;
} {
  const lastPrimary = s.lastPlace ? primaryPlaceFromDestination(s.lastPlace) : "";
  let places = "Destinations from trips you’ve completed";
  if (s.firstPlaceVisited && lastPrimary && s.firstPlaceVisited.toLowerCase() !== lastPrimary.toLowerCase()) {
    places = `From ${s.firstPlaceVisited} to ${lastPrimary}`;
  } else if (s.lastPlace) {
    places = `Latest · ${s.lastPlace}`;
  } else if (s.placesVisited === 0) {
    places = "Mark a trip complete to map where you’ve been";
  }

  let countries =
    s.countriesVisited <= 1
      ? "Your country footprint grows with each trip"
      : `Across ${s.countriesVisited} countries so far`;

  const flights =
    s.flights === 0
      ? "Flight-style timeline actions on completed trips"
      : `${s.flights} logged from your completed trips`;

  const restaurants =
    s.restaurants === 0
      ? "A growing food trail from your timelines"
      : `${s.restaurants} dining moments worth revisiting`;

  const days =
    s.daysTraveled === 0
      ? "Time spent exploring (from trip dates)"
      : `${s.daysTraveled} total days across completed trips`;

  const last = s.lastPlace
    ? "Your most recently completed destination"
    : "Shows when you finish your next trip";

  return { places, countries, flights, restaurants, days, last };
}

type Props = {
  stats: UserStats;
};

export function StatsPageClient({ stats: s }: Props) {
  const copy = buildCopy(s);
  const tripDelta = s.completedTripsThisYear - s.completedTripsLastYear;
  const year = new Date().getFullYear();
  const travelStory = getTravelStory(s);

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`rounded-2xl border border-white/[0.11] bg-gradient-to-b from-white/[0.09] to-white/[0.025] p-7 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/38">Travel Story</p>
        <p className="mt-4 text-[17px] font-medium leading-relaxed tracking-[-0.015em] text-white/[0.92]">
          {travelStory}
        </p>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3"
      >
      <motion.div variants={cardVariants}>
        <AnimatedStatCard
          label="Places visited"
          numericValue={s.placesVisited}
          subtext={copy.places}
          milestone={{ current: s.placesVisited, target: 10, label: "Milestone · 10 places" }}
          barDelay={0.2}
        />
      </motion.div>

      <motion.div variants={cardVariants}>
        <AnimatedStatCard
          label="Countries visited"
          numericValue={s.countriesVisited}
          subtext={copy.countries}
          milestone={{ current: s.countriesVisited, target: 5, label: "Milestone · 5 countries" }}
          barDelay={0.22}
        />
      </motion.div>

      <motion.div variants={cardVariants}>
        <AnimatedStatCard
          label="Flights taken"
          numericValue={s.flights}
          subtext={copy.flights}
          barDelay={0.24}
        />
      </motion.div>

      <motion.div variants={cardVariants}>
        <AnimatedStatCard
          label="Restaurants discovered"
          numericValue={s.restaurants}
          subtext={copy.restaurants}
          barDelay={0.26}
        />
      </motion.div>

      <motion.div variants={cardVariants}>
        <AnimatedStatCard
          label="Days traveled"
          numericValue={s.daysTraveled}
          subtext={copy.days}
          milestone={{ current: s.daysTraveled, target: 50, label: "Milestone · 50 travel days" }}
          barDelay={0.28}
        />
      </motion.div>

      <motion.div variants={cardVariants}>
        <AnimatedStatCard
          label="Last place"
          textValue={s.lastPlace ?? "—"}
          subtext={copy.last}
          barDelay={0.3}
        />
      </motion.div>

      {s.completedTripCount > 0 ? (
        <motion.div variants={cardVariants} className={`${surfaceCard} p-5`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">At a glance</p>
          <ul className="mt-3 space-y-2.5 text-[13px] leading-snug text-white/55">
            <li>
              <span className="text-white/40">Completed trips · </span>
              <span className="text-white/75">{s.completedTripCount}</span>
              {s.completedTripsThisYear > 0 ? (
                <span className="text-white/35">
                  {" "}
                  · {s.completedTripsThisYear} in {year}
                  {s.completedTripsLastYear > 0 ? (
                    <span className="text-white/32">
                      {" "}
                      ({tripDelta >= 0 ? "+" : ""}
                      {tripDelta} vs {year - 1})
                    </span>
                  ) : null}
                </span>
              ) : null}
            </li>
            {s.placesVisitedThisYear > 0 ? (
              <li>
                <span className="text-white/40">New places this year · </span>
                <span className="text-white/75">{s.placesVisitedThisYear}</span>
                <span className="text-white/32"> distinct stops on trips you wrapped up in {new Date().getFullYear()}</span>
              </li>
            ) : null}
            {s.favoritePlaceVisited && s.favoritePlaceTripCount > 0 ? (
              <li>
                <span className="text-white/40">Favorite stop · </span>
                <span className="text-white/75">{s.favoritePlaceVisited}</span>
                <span className="text-white/32"> · {s.favoritePlaceTripCount} completed trip{s.favoritePlaceTripCount !== 1 ? "s" : ""}</span>
              </li>
            ) : null}
            <li>
              <span className="text-white/40">Average trip · </span>
              <span className="text-white/75">{s.averageTripLengthDays} days</span>
              {s.longestTripDays > 0 ? (
                <>
                  <span className="text-white/32"> · longest </span>
                  <span className="text-white/75">{s.longestTripDays} days</span>
                </>
              ) : null}
            </li>
          </ul>
        </motion.div>
      ) : null}
      </motion.div>
    </div>
  );
}
