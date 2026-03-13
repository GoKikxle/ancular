import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { TripSwitcher } from "@/components/trips/TripSwitcher";
import { FadeUp } from "@/components/motion/FadeUp";
import { StaggerList, StaggerItem } from "@/components/motion/StaggerList";
import { getTrips } from "@/lib/trips-store";

function statusBorderClass(status: string) {
  if (status === "Active") return "border-l-emerald-500/50";
  if (status === "Upcoming") return "border-l-amber-500/40";
  return "border-l-white/[0.08]";
}

function statusBadgeClass(status: string) {
  if (status === "Active") return "bg-emerald-500/15 text-emerald-300";
  if (status === "Upcoming") return "bg-amber-500/15 text-amber-300";
  return "bg-white/10 text-white/45";
}

export default function Home() {
  const trips = getTrips();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <PageContainer>
        <FadeUp>
          <header className="mb-7 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-white/[0.07] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/30">
                Ancular
              </div>
              <h1 className="text-[28px] font-semibold tracking-[-0.02em]">
                Your Trips
              </h1>
            </div>

            <Link
              href="/trips/new"
              className="mt-[3px] rounded-2xl border border-white/[0.09] bg-white/[0.04] px-3.5 py-2 text-[13px] text-white/60 transition hover:bg-white/[0.07] hover:text-white/80"
            >
              + New
            </Link>
          </header>
        </FadeUp>

        <FadeUp delay={0.06}>
          <TripSwitcher trips={trips} />
        </FadeUp>

        <StaggerList className="space-y-3">
          {trips.map((trip) => (
            <StaggerItem key={trip.id}>
              <Link
                href={`/trips/${trip.slug}`}
                className={`block rounded-3xl border border-l-2 bg-white/[0.04] p-5 transition hover:bg-white/[0.06] border-white/[0.08] ${statusBorderClass(trip.status)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-[17px] font-semibold tracking-[-0.01em]">
                    {trip.title}
                  </h2>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadgeClass(trip.status)}`}
                  >
                    {trip.status}
                  </span>
                </div>

                <p className="mt-1.5 text-[13px] text-white/40">
                  {trip.dates} · {trip.travelers}
                </p>

                {trip.nextActionTitle && (
                  <p className="mt-3 line-clamp-1 border-t border-white/[0.06] pt-3 text-[12px] text-white/30">
                    {trip.nextActionTitle}
                  </p>
                )}
              </Link>
            </StaggerItem>
          ))}

          {trips.length === 0 && (
            <StaggerItem>
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-10 text-center">
                <p className="text-[15px] text-white/35">No trips yet</p>
                <Link
                  href="/trips/new"
                  className="mt-3 inline-block text-[13px] text-white/50 underline underline-offset-4 hover:text-white/70"
                >
                  Create your first trip →
                </Link>
              </div>
            </StaggerItem>
          )}
        </StaggerList>
      </PageContainer>
    </main>
  );
}
