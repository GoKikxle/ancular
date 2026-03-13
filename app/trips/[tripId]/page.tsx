import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { BackButton } from "@/components/layout/BackButton";
import { TripSwitcher } from "@/components/trips/TripSwitcher";
import { TripActions } from "@/components/trips/TripActions";
import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { DocumentsCard } from "@/components/dashboard/DocumentsCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { NearbyCard } from "@/components/dashboard/NearbyCard";
import { FadeUp } from "@/components/motion/FadeUp";
import { getTripBySlug, getTrips } from "@/lib/trips-store";
import { deleteTripById } from "@/app/trips/actions";

type TripDetailPageProps = {
  params: Promise<{ tripId: string }>;
};

function statusBadgeClass(status: string) {
  if (status === "Active") return "bg-emerald-500/15 text-emerald-300";
  if (status === "Upcoming") return "bg-amber-500/15 text-amber-300";
  return "bg-white/10 text-white/45";
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { tripId } = await params;
  const trip = getTripBySlug(tripId);

  if (!trip) notFound();

  const allTrips = getTrips();
  const deleteThisTrip = deleteTripById.bind(null, trip.id);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <PageContainer>
        {/* Top nav */}
        <FadeUp>
          <BackButton href="/" label="All Trips" />
          <TripSwitcher trips={allTrips} currentSlug={trip.slug} />
        </FadeUp>

        {/* Trip header */}
        <FadeUp delay={0.06}>
          <header className="mb-7">
            <div className="mb-2 flex items-center gap-2.5">
              <p className="text-[11px] uppercase tracking-[0.1em] text-white/35">
                Trip Overview
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadgeClass(trip.status)}`}
              >
                {trip.status}
              </span>
            </div>
            <h1 className="text-[28px] font-semibold tracking-[-0.02em]">
              {trip.title}
            </h1>
            <p className="mt-1.5 text-[14px] text-white/45">
              {trip.dates} · {trip.travelers}
            </p>
          </header>
        </FadeUp>

        {/* Next action */}
        {trip.nextActionTitle && (
          <FadeUp delay={0.1}>
            <NextActionCard
              title={trip.nextActionTitle}
              description={trip.nextActionDescription}
              buttonLabel="Open Timeline"
              buttonHref="#timeline"
            />
          </FadeUp>
        )}

        {/* Timeline */}
        <FadeUp delay={0.14}>
          <TimelineCard items={trip.timeline} />
        </FadeUp>

        {/* Info grid */}
        <FadeUp delay={0.18}>
          <div className="space-y-3">
            <DocumentsCard items={trip.documents} />
            <WeatherCard summary={trip.weatherSummary} note={trip.weatherNote} />
            <NearbyCard items={trip.nearby} />
          </div>
        </FadeUp>

        {/* Danger zone */}
        <FadeUp delay={0.22}>
          <TripActions onDelete={deleteThisTrip} />
        </FadeUp>
      </PageContainer>
    </main>
  );
}
