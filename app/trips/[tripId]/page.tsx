import { DocumentsCard } from "@/components/dashboard/DocumentsCard";
import { NearbyCard } from "@/components/dashboard/NearbyCard";
import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { CurrentTripCard } from "@/components/trips/CurrentTripCard";
import { getTripBySlug } from "@/lib/get-trip-by-slug";
import { notFound } from "next/navigation";

type TripDetailPageProps = {
  params: Promise<{
    tripId: string;
  }>;
};

export default async function TripDetailPage({
  params,
}: TripDetailPageProps) {
  const { tripId } = await params;
  const trip = getTripBySlug(tripId);

  if (!trip) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <header className="mb-8">
          <p className="text-sm text-white/50">Trip Overview</p>
          <h1 className="text-3xl font-semibold tracking-tight">{trip.title}</h1>
          <p className="mt-2 text-sm text-white/70">
            Everything you need for this trip in one place.
          </p>
        </header>

        <CurrentTripCard
          title={trip.title}
          dates={trip.dates}
          travelers={trip.travelers}
          status={trip.status}
        />

        <NextActionCard
          title={trip.nextActionTitle}
          description={trip.nextActionDescription}
          buttonLabel="Open Timeline"
          buttonHref="#timeline"
        />

        <TimelineCard items={trip.timeline} />

        <section className="grid gap-4">
          <DocumentsCard items={trip.documents} />
          <WeatherCard
            summary={trip.weatherSummary}
            note={trip.weatherNote}
          />
          <NearbyCard items={trip.nearby} />
        </section>
      </PageContainer>
    </main>
  );
}