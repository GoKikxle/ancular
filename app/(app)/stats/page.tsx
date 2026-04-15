import type { TravelMapPoint } from "@/components/TravelMap";
import { StatsPageClient } from "@/components/stats/StatsPageClient";
import { getUserStats } from "@/lib/stats";

const travelMapPoints: TravelMapPoint[] = [
  { id: "zakynthos", name: "Zakynthos", lat: 37.78, lng: 20.9, active: true },
  { id: "athens", name: "Athens", lat: 37.98, lng: 23.73 },
  { id: "crete", name: "Crete", lat: 35.34, lng: 25.14 },
  { id: "thessaloniki", name: "Thessaloniki", lat: 40.64, lng: 22.94 },
];

export default async function StatsPage() {
  const stats = await getUserStats();

  return (
    <main className="min-h-full bg-[#F8F8F8] pb-24 text-[#111111] dark:bg-neutral-950 dark:text-white">
      <StatsPageClient stats={stats} mapPoints={travelMapPoints} />
    </main>
  );
}
