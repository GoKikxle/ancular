import { DocumentsCard } from "@/components/dashboard/DocumentsCard";
import { NearbyCard } from "@/components/dashboard/NearbyCard";
import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { CurrentTripCard } from "@/components/trips/CurrentTripCard";

export default function Home() {
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
          title="Barcelona Getaway"
          dates="Apr 12 → Apr 18"
          travelers="2 travelers"
          status="Active"
        />

        <NextActionCard
          title="Leave for airport at 4:30 PM"
          description="International flight check-in closes 1 hour before departure."
          buttonLabel="View Timeline"
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