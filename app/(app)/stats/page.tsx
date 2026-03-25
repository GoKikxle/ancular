import { PageContainer } from "@/components/layout/PageContainer";
import { getUserStats } from "@/lib/stats";
import {
  screenEyebrow,
  screenHeaderWrap,
  screenSubtitle,
  screenTitle,
  surfaceCard,
} from "@/lib/screen-styles";

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className={`${surfaceCard} p-6`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{label}</p>
      <p className="mt-3 text-[32px] font-bold leading-none tracking-[-0.03em] tabular-nums text-white">
        {value}
      </p>
    </div>
  );
}

export default async function StatsPage() {
  const stats = await getUserStats();

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <header className={screenHeaderWrap}>
          <p className={screenEyebrow}>Your travel stats</p>
          <h1 className={screenTitle}>My Stats</h1>
          <p className={screenSubtitle}>From trips you’ve marked as completed</p>
        </header>

        <div className="flex flex-col gap-3">
          <StatCard label="Places visited" value={stats.placesVisited} />
          <StatCard label="Flights" value={stats.flights} />
          <StatCard label="Miles traveled" value={stats.milesTraveled ?? "—"} />
          <StatCard label="Time traveled" value={stats.timeTraveled ?? "—"} />
          <StatCard label="Restaurants discovered" value={stats.restaurantsDiscovered} />
        </div>
      </PageContainer>
    </main>
  );
}
