import Link from "next/link";
import { NowCard } from "@/components/dashboard/NowCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { getCurrentProfile } from "@/lib/profile";
import { getActiveTripsForHome } from "@/lib/trips";
import { getUpcomingNowItem } from "@/lib/now-card";

function getGreetingName(fullName: string | null): string {
  if (!fullName?.trim()) return "there";
  const first = fullName.trim().split(/\s+/)[0];
  return first || "there";
}

/** Shared card shell for home — matches hero + trip cards */
const homeCardClass =
  "rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-white/[0.025] shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]";

export default async function Home() {
  const [profile, activeTrips, nowItem] = await Promise.all([
    getCurrentProfile(),
    getActiveTripsForHome(),
    getUpcomingNowItem(),
  ]);
  const name = getGreetingName(profile?.full_name ?? null);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <header className="mb-10 pt-1">
          <h1 className="text-[17px] font-medium leading-snug tracking-[-0.01em] text-white/80">
            Hello {name}
          </h1>
          <p className="mt-1 text-[14px] leading-relaxed text-white/42">Where are we off to today?</p>
        </header>

        {/* Next action — primary hero */}
        <section className="mb-14" aria-labelledby="next-action-heading">
          <h2 id="next-action-heading" className="sr-only">
            Next action
          </h2>
          {nowItem ? (
            <NowCard item={nowItem} />
          ) : (
            <div className={`${homeCardClass} p-7`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Next action</p>
              <p className="mt-4 text-[17px] font-semibold text-white/88">Nothing scheduled right now</p>
              <p className="mt-2 max-w-[280px] text-[14px] leading-relaxed text-white/45">
                Add timeline items on a trip to see your next steps here.
              </p>
              <Link
                href="/trips"
                className="mt-6 inline-flex min-h-[44px] items-center text-[14px] font-semibold text-sky-400 transition-colors hover:text-sky-300"
              >
                View trips →
              </Link>
            </div>
          )}
        </section>

        {/* Active trips */}
        <section className="space-y-6" aria-labelledby="active-trips-heading">
          <header className="flex items-start justify-between gap-4 pb-1">
            <div className="min-w-0">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40"
                id="active-trips-heading"
              >
                Active trips
              </p>
              <h2 className="mt-2 text-[18px] font-bold tracking-[-0.02em] text-white">Current &amp; upcoming</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/45">
                Trips you&apos;re planning or on now
              </p>
            </div>
            <Link
              href="/trips/new"
              className="flex-shrink-0 rounded-xl border border-white/[0.12] bg-white/[0.06] px-3.5 py-2.5 text-[13px] font-semibold text-white/85 transition-colors hover:bg-white/[0.1] active:scale-[0.98]"
            >
              + New trip
            </Link>
          </header>

          {activeTrips.length === 0 ? (
            <div className={`${homeCardClass} px-6 py-10 text-center`}>
              <p className="text-[16px] font-semibold text-white/80">No active trips</p>
              <p className="mx-auto mt-2 max-w-[260px] text-[14px] leading-relaxed text-white/45">
                Start a trip or open{" "}
                <Link href="/trips" className="font-medium text-white/65 underline decoration-white/20 underline-offset-2">
                  all trips
                </Link>{" "}
                for past ones.
              </p>
              <Link
                href="/trips/new"
                className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-6 py-3 text-[14px] font-semibold text-neutral-950 transition-opacity hover:opacity-95 active:scale-[0.98]"
              >
                Create a trip
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {activeTrips.map((trip) => (
                <li key={trip.id}>
                  <Link
                    href={`/trips/${trip.slug}`}
                    className={`${homeCardClass} block p-6 transition-[border-color,background-color] duration-200 hover:border-white/[0.14] hover:from-white/[0.08] active:scale-[0.99]`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[17px] font-bold leading-snug tracking-[-0.02em] text-white">{trip.title}</h3>
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
                            : "bg-amber-500/12 text-amber-200/90"
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
        </section>
      </PageContainer>
    </main>
  );
}
