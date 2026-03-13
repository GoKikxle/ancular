import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { CurrentTripCard } from "@/components/trips/CurrentTripCard";
import { trips } from "@/data/trips";

export default function DashboardPage() {
  const activeTrip = trips[0];

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <header className="mb-8">
          <p className="text-sm text-white/50">Good evening</p>
          <h1 className="text-3xl font-semibold tracking-tight">Your trips</h1>
        </header>

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