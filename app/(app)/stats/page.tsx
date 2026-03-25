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
      <p className="mt-3 break-words text-[32px] font-bold leading-tight tracking-[-0.03em] text-white tabular-nums">
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
          <StatCard label="Countries visited" value={stats.countriesVisited} />
          <StatCard label="Flights taken" value={stats.flights} />
          <StatCard label="Restaurants discovered" value={stats.restaurants} />
          <StatCard label="Days traveled" value={stats.daysTraveled} />
          <StatCard label="Last place" value={stats.lastPlace ?? "—"} />
        </div>
      </PageContainer>
    </main>
  );
}
