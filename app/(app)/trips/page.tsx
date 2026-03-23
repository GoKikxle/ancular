import { PageContainer } from "@/components/layout/PageContainer";
import { TripsIndexClient } from "@/components/trips/TripsIndexClient";
import { getTrips } from "@/lib/trips";

export default async function TripsIndexPage() {
  const trips = await getTrips();

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <TripsIndexClient trips={trips} />
      </PageContainer>
    </main>
  );
}
