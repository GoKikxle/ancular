import { TripsIndexClient } from "@/components/trips/TripsIndexClient";
import { getArchivedTrips } from "@/lib/trips";

export default async function ArchivedTripsPage() {
  const trips = await getArchivedTrips();

  return (
    <main className="min-h-screen bg-[#F8F8F8] text-[#111111] dark:bg-[#030303] dark:text-white">
      <TripsIndexClient variant="archived" trips={trips} />
    </main>
  );
}
