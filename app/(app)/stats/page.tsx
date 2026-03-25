import { PageContainer } from "@/components/layout/PageContainer";
import { StatsPageClient } from "@/components/stats/StatsPageClient";
import { getUserStats } from "@/lib/stats";
import {
  screenEyebrow,
  screenHeaderWrap,
  screenSubtitle,
  screenTitle,
} from "@/lib/screen-styles";

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

        <StatsPageClient stats={stats} />
      </PageContainer>
    </main>
  );
}
