import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { BackButton } from "@/components/layout/BackButton";
import { TripSwitcher } from "@/components/trips/TripSwitcher";
import { TripActions } from "@/components/trips/TripActions";
import { CurrentTripCard } from "@/components/trips/CurrentTripCard";
import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { DocumentsCard } from "@/components/dashboard/DocumentsCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { NearbyCard } from "@/components/dashboard/NearbyCard";
import { getTripBySlug, getTrips } from "@/lib/trips-store";
import { deleteTripById } from "@/app/trips/actions";

type TripDetailPageProps = {
  params: Promise<{ tripId: string }>;
};

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { tripId } = await params;
  const trip = getTripBySlug(tripId);

  if (!trip) notFound();

  const allTrips = getTrips();

  // Bind the trip ID so TripActions can call it without knowing the ID itself.
  const deleteThisTrip = deleteTripById.bind(null, trip.id);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <BackButton href="/" label="All Trips" />

        <TripSwitcher trips={allTrips} currentSlug={trip.slug} />

        <header className="mb-8">
          <p className="text-sm text-white/50">Trip Overview</p>
          <h1 className="text-3xl font-semibold tracking-tight">{trip.title}</h1>
        </header>

        <CurrentTripCard
          title={trip.title}
          dates={trip.dates}
          travelers={trip.travelers}
          status={trip.status}
        />

        {trip.nextActionTitle && (
          <NextActionCard
            title={trip.nextActionTitle}
            description={trip.nextActionDescription}
            buttonLabel="Open Timeline"
            buttonHref="#timeline"
          />
        )}

        <TimelineCard items={trip.timeline} />

        <section className="grid gap-4">
          <DocumentsCard items={trip.documents} />
          <WeatherCard summary={trip.weatherSummary} note={trip.weatherNote} />
          <NearbyCard items={trip.nearby} />
        </section>

        <TripActions onDelete={deleteThisTrip} />
      </PageContainer>
    </main>
  );
}
