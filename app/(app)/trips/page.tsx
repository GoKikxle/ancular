import { TripsIndexClient } from "@/components/trips/TripsIndexClient";
import { getIncompleteTrips } from "@/lib/trips";

export default async function TripsIndexPage() {
  const trips = await getIncompleteTrips();

  return (
    <main className="min-h-screen bg-[#FBFBFB]">
      <TripsIndexClient trips={trips} />
    </main>
  );
}
