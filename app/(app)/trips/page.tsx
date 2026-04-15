import { TripsIndexClient } from "@/components/trips/TripsIndexClient";
import { getIncompleteTrips } from "@/lib/trips";

export default async function TripsIndexPage() {
  const trips = await getIncompleteTrips();

  return (
    <main className="bg-[#F8F8F8] dark:bg-neutral-950">
      <TripsIndexClient trips={trips} />
    </main>
  );
}
