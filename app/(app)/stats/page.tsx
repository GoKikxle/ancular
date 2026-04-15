import { StatsPageClient } from "@/components/stats/StatsPageClient";
import { getUserStats } from "@/lib/stats";

export default async function StatsPage() {
  const stats = await getUserStats();

  return (
    <main
      className="min-h-full text-white"
      style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #0D0D10 100%)" }}
    >
      <StatsPageClient stats={stats} />
    </main>
  );
}
