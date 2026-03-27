import { PageContainer } from "@/components/layout/PageContainer";
import { TripsIndexClient } from "@/components/trips/TripsIndexClient";
import { getArchivedTrips } from "@/lib/trips";

export default async function ArchivedTripsPage() {
  const trips = await getArchivedTrips();

  return (
    <main className="min-h-screen bg-[#030303] text-white">
      <PageContainer>
        <TripsIndexClient variant="archived" trips={trips} />
      </PageContainer>
    </main>
  );
}
