import Link from "next/link";
import { NowCard } from "@/components/dashboard/NowCard";
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
    <main className="min-h-screen text-[#111111]" style={{ background: "#F8F8F8" }}>
      <div className="px-5">
        {/* Header */}
        <header className="flex items-center justify-between pt-[22px] pb-[18px]">
          <div>
            <h1 className="text-[24px] font-bold tracking-[-0.03em] text-[#111111]">
              Hello {name}
            </h1>
            <p className="mt-[3px] text-[13px] leading-snug text-[#9A9A9A]">
              Where are we off to today?
            </p>
          </div>
          {/* Spacer for AppShell avatar */}
          <div className="h-10 w-10 shrink-0" aria-hidden />
        </header>

        {/* Hero — next action */}
        <section className="mb-5" aria-labelledby="next-action-heading">
          <h2 id="next-action-heading" className="sr-only">Next action</h2>
          {nowItem ? (
            <NowCard item={nowItem} light />
          ) : (
            <div className="rounded-[16px] border border-[#EBEBEB] bg-white p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#AAAAAA]">
                Next action
              </p>
              <p className="mt-3 text-[17px] font-semibold text-[#111111]">
                Nothing scheduled right now
              </p>
              <p className="mt-1.5 max-w-[280px] text-[13px] leading-relaxed text-[#9A9A9A]">
                Add timeline items on a trip to see your next steps here.
              </p>
              <Link
                href="/trips"
                className="mt-5 inline-flex min-h-[40px] items-center text-[13px] font-semibold text-sky-500 transition-colors hover:text-sky-600"
              >
                View trips →
              </Link>
            </div>
          )}
        </section>

        {/* Active trips */}
        <section className="pb-10" aria-labelledby="active-trips-heading">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                id="active-trips-heading"
                style={{ color: "#AAAAAA" }}
              >
                Active trips
              </p>
              <h2 className="mt-1 text-[18px] font-bold tracking-[-0.02em] text-[#111111]">
                Current &amp; upcoming
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-[#9A9A9A]">
                Trips you&apos;re planning or on now
              </p>
            </div>
            <Link
              href="/trips/new"
              className="mt-1 shrink-0 rounded-[12px] border border-[#E5E5E5] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#444444] active:scale-[0.97]"
            >
              + New trip
            </Link>
          </div>

          {activeTrips.length === 0 ? (
            <div className="rounded-[16px] border border-[#EBEBEB] bg-white px-6 py-10 text-center">
              <p className="text-[15px] font-semibold text-[#111111]">No active trips</p>
              <p className="mx-auto mt-2 max-w-[260px] text-[13px] leading-relaxed text-[#9A9A9A]">
                Start a trip, open{" "}
                <Link href="/trips" className="font-medium text-[#555555] underline underline-offset-2">
                  all trips
                </Link>
                , or{" "}
                <Link href="/trips/archived" className="font-medium text-[#555555] underline underline-offset-2">
                  archived
                </Link>
                .
              </p>
              <Link
                href="/trips/new"
                className="mt-7 inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-[#E5E5E5] bg-white px-6 text-[14px] font-semibold text-[#111111] active:scale-[0.98]"
              >
                Create a trip
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-[10px]">
              {activeTrips.map((trip) => (
                <li key={trip.id}>
                  <Link
                    href={`/trips/${trip.slug}`}
                    className="block rounded-[16px] border border-[#EBEBEB] bg-white p-5 active:opacity-80"
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[16px] font-bold leading-snug tracking-[-0.02em] text-[#111111]">
                          {trip.title}
                        </h3>
                        <p className="mt-1 text-[12px] leading-relaxed text-[#9A9A9A]">
                          {trip.dates}
                          {trip.travelers ? ` · ${trip.travelers}` : null}
                        </p>
                        {trip.destination?.trim() ? (
                          <p className="mt-0.5 text-[12px] text-[#AAAAAA]">
                            {trip.destination.trim()}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          trip.status === "Active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>
                    <p className="mt-3 border-t border-[#F0F0F0] pt-3 text-[12px] leading-relaxed text-[#AAAAAA]">
                      {trip.next_action_title?.trim() || "Add your next action"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
