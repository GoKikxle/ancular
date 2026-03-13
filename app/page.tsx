import { DocumentsCard } from "@/components/dashboard/DocumentsCard";
import { NearbyCard } from "@/components/dashboard/NearbyCard";
import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { CurrentTripCard } from "@/components/trips/CurrentTripCard";
import { trips } from "@/data/trips";

export default function Home() {
  const trip = trips[0];

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            Ancular
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Everything about your trip in one place.
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/70">
            A mobile-first travel command center for tickets, documents,
            reminders, weather, and what to do next.
          </p>
        </header>

        <CurrentTripCard
          title={trip.title}
          dates={trip.dates}
          travelers={trip.travelers}
          status={trip.status}
          href={`/trips/${trip.slug}`}
        />

        <NextActionCard
          title={trip.nextActionTitle}
          description={trip.nextActionDescription}
          buttonLabel="View Timeline"
          buttonHref={`/trips/${trip.slug}#timeline`}
        />

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