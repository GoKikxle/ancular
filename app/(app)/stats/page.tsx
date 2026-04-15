import TravelMap from "@/components/TravelMap";
import { StatsPageClient } from "@/components/stats/StatsPageClient";
import { getUserStats } from "@/lib/stats";
import { screenEyebrowLight } from "@/lib/screen-styles";

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
      <section className="px-5 pt-[22px]" aria-labelledby="travel-map-heading">
        <header className="mb-4">
          <p className={screenEyebrowLight}>Travel map</p>
          <h2
            id="travel-map-heading"
            className="mt-1 text-[18px] font-bold tracking-[-0.02em] text-[#111111] dark:text-white"
          >
            Your destinations
          </h2>
        </header>
        <TravelMap points={travelMapPoints} />
      </section>
      <StatsPageClient stats={stats} />
    </main>
  );
}
