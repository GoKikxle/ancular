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
        <header className="mb-8">
          <h1 className="text-[22px] font-semibold leading-[1.3] tracking-[-0.02em] text-white">
            Hello {name}, where are we off to today?
          </h1>
        </header>

        {/* Next action — primary hero */}
        <section className="mb-10" aria-labelledby="next-action-heading">
          <h2 id="next-action-heading" className="sr-only">
            Next action
          </h2>
          {nowItem ? (
            <NowCard item={nowItem} />
          ) : (
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">Next action</p>
              <p className="mt-3 text-[16px] font-medium text-white/55">Nothing scheduled right now</p>
              <p className="mt-2 text-[14px] leading-relaxed text-white/38">
                Add timeline items on a trip to see your next steps here.
              </p>
              <Link
                href="/trips"
                className="mt-5 inline-flex text-[14px] font-medium text-sky-400/90 transition-colors hover:text-sky-300"
              >
                View trips →
              </Link>
            </div>
          )}
        </section>

        {/* Active trips only */}
        <section className="space-y-4" aria-labelledby="active-trips-heading">
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/35" id="active-trips-heading">
                Active trips
              </p>
              <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-white/90">
                Current &amp; upcoming
              </h2>
              <p className="mt-1.5 text-[14px] text-white/40">Trips you&apos;re planning or on now</p>
            </div>
            <Link
              href="/trips/new"
              className="flex-shrink-0 rounded-2xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-[14px] font-medium text-white/80 transition-colors hover:bg-white/[0.08]"
            >
              + New trip
            </Link>
          </header>

          {activeTrips.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-8 text-center">
              <p className="text-[15px] font-medium text-white/50">No active trips</p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/35">
                Start a trip or open <Link href="/trips" className="text-white/55 underline underline-offset-2">all trips</Link> for past
                ones.
              </p>
              <Link
                href="/trips/new"
                className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-[14px] font-semibold text-neutral-950"
              >
                Create a trip
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {activeTrips.map((trip) => (
                <li key={trip.id}>
                  <Link
                    href={`/trips/${trip.slug}`}
                    className="block rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 transition-colors hover:border-white/[0.12] hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold">{trip.title}</h3>
                        <p className="mt-1 text-sm text-white/70">
                          {trip.dates} • {trip.travelers}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          trip.status === "Active"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-white/60">{trip.next_action_title}</p>
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
