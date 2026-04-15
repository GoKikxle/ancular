import TravelMap from "@/components/TravelMap";
import { StatsPageClient } from "@/components/stats/StatsPageClient";
import { getUserStats } from "@/lib/stats";

const travelMapPoints = [
  { id: "zakynthos", name: "Zakynthos", x: 32, y: 58, active: true },
  { id: "athens", name: "Athens", x: 52, y: 55 },
  { id: "crete", name: "Crete", x: 60, y: 82 },
  { id: "thessaloniki", name: "Thessaloniki", x: 55, y: 25 },
];

export default async function StatsPage() {
  const stats = await getUserStats();

  return (
    <main className="min-h-full bg-[#F8F8F8] pb-24 text-[#111111] dark:bg-neutral-950 dark:text-white">
      <div className="p-4">
        <TravelMap points={travelMapPoints} />
      </div>
      <StatsPageClient stats={stats} />
    </main>
  );
}
