import { PageContainer } from "@/components/layout/PageContainer";
import { getUserStats } from "@/lib/stats";

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/35">
        {label}
      </p>
      <p className="mt-2 text-[24px] font-semibold tracking-tight text-white">
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
        <header className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/35">
            Your travel stats
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em] text-white">
            My Stats
          </h1>
          <p className="mt-1.5 text-[14px] text-white/40">
            Places, flights, and memories from your trips
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="Places visited" value={stats.placesVisited} />
          <StatCard label="Flights" value={stats.flights} />
          <StatCard
            label="Miles traveled"
            value={stats.milesTraveled ?? "—"}
          />
          <StatCard
            label="Time traveled"
            value={stats.timeTraveled ?? "—"}
          />
          <StatCard
            label="Restaurants discovered"
            value={stats.restaurantsDiscovered}
          />
        </div>
      </PageContainer>
    </main>
  );
}
