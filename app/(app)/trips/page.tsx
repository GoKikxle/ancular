import { PageContainer } from "@/components/layout/PageContainer";
import { TripsIndexClient } from "@/components/trips/TripsIndexClient";
import { getIncompleteTrips } from "@/lib/trips";

export default async function TripsIndexPage() {
  const trips = await getIncompleteTrips();

  return (
    <main className="min-h-screen bg-[#030303] text-white">
      <PageContainer>
        <TripsIndexClient trips={trips} />
      </PageContainer>
    </main>
  );
}
