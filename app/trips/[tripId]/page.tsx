import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { DocumentsCard } from "@/components/dashboard/DocumentsCard";
import { NearbyCard } from "@/components/dashboard/NearbyCard";
import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { CurrentTripCard } from "@/components/trips/CurrentTripCard";

type TripDetailPageProps = {
  params: Promise<{
    tripId: string;
  }>;
};

export default async function TripDetailPage({
  params,
}: TripDetailPageProps) {
  const { tripId } = await params;

  const tripTitle =
    tripId === "barcelona-getaway" ? "Barcelona Getaway" : "Trip Detail";

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <header className="mb-8">
          <p className="text-sm text-white/50">Trip Overview</p>
          <h1 className="text-3xl font-semibold tracking-tight">{tripTitle}</h1>
          <p className="mt-2 text-sm text-white/70">
            Everything you need for this trip in one place.
          </p>
        </header>

        <CurrentTripCard
          title="Barcelona Getaway"
          dates="Apr 12 → Apr 18"
          travelers="2 travelers"
          status="Active"
        />

        <NextActionCard
          title="Leave for airport at 4:30 PM"
          description="International flight check-in closes 1 hour before departure."
          buttonLabel="Open Timeline"
          buttonHref="#timeline"
        />

        <TimelineCard
          items={[
            {
              time: "4:30 PM",
              title: "Leave for airport",
              note: "Make sure to arrive at the airport at least 2 hours before your flight."
            },
            {
              time: "5:00 PM",
              title: "Check-in at the airport",
              note: "Proceed to the check-in counter and present your identification and boarding pass."
            }
          ]}
        />

        <section className="grid gap-4">
          <DocumentsCard
            items={["Flight ticket", "Hotel confirmation", "Passport copy"]}
          />
          <WeatherCard
            summary="22°C Sunny"
            note="Great weather for walking and outdoor dining."
          />
          <NearbyCard
            items={[
              "Brunch spot 6 min away",
              "Pharmacy 4 min away",
              "Beach entrance 12 min away",
            ]}
          />
        </section>
      </PageContainer>
    </main>
  );
}