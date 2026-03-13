import { PageContainer } from "@/components/layout/PageContainer";
import { TripSwitcher } from "@/components/trips/TripSwitcher";
import { CurrentTripCard } from "@/components/trips/CurrentTripCard";
import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { getTrips } from "@/lib/trips-store";

export default function DashboardPage() {
  const trips = getTrips();
  const activeTrip = trips[0];

  if (!activeTrip) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <PageContainer>
          <p className="text-sm text-white/50">No trips found.</p>
        </PageContainer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <header className="mb-8">
          <p className="text-sm text-white/50">Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight">Your Trips</h1>
        </header>

        <TripSwitcher trips={trips} currentSlug={activeTrip.slug} />

        <CurrentTripCard
          title={activeTrip.title}
          dates={activeTrip.dates}
          travelers={activeTrip.travelers}
          status={activeTrip.status}
          href={`/trips/${activeTrip.slug}`}
        />

        <NextActionCard
          title={activeTrip.nextActionTitle}
          description={activeTrip.nextActionDescription}
          buttonLabel="Open Trip Timeline"
          buttonHref={`/trips/${activeTrip.slug}#timeline`}
        />

        <section className="space-y-4">
          {trips.slice(1).map((trip) => (
            <CurrentTripCard
              key={trip.id}
              title={trip.title}
              dates={trip.dates}
              travelers={trip.travelers}
              status={trip.status}
              href={`/trips/${trip.slug}`}
            />
          ))}
        </section>
      </PageContainer>
    </main>
  );
}
