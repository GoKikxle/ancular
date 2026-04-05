import { TripsIndexClient } from "@/components/trips/TripsIndexClient";
import { getArchivedTrips } from "@/lib/trips";

export default async function ArchivedTripsPage() {
  const trips = await getArchivedTrips();

  return (
    <main className="min-h-screen bg-[#030303] text-white">
      <TripsIndexClient variant="archived" trips={trips} />
    </main>
  );
}
