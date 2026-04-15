import { StatsPageClient } from "@/components/stats/StatsPageClient";
import { getUserStats } from "@/lib/stats";

export default async function StatsPage() {
  const stats = await getUserStats();

  return (
    <main className="min-h-full bg-[#F8F8F8] pb-24 text-[#111111] dark:bg-neutral-950 dark:text-white">
      <StatsPageClient stats={stats} />
    </main>
  );
}
