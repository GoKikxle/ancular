import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { CurrentTripCard } from "@/components/trips/CurrentTripCard";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <header className="mb-8">
          <p className="text-sm text-white/50">Good evening</p>
          <h1 className="text-3xl font-semibold tracking-tight">Your trips</h1>
        </header>

        <CurrentTripCard
          title="Barcelona Getaway"
          dates="Apr 12 → Apr 18"
          travelers="2 travelers"
          status="Active"
          href="/trips/barcelona-getaway"
        />

        <NextActionCard
          title="Leave for airport at 4:30 PM"
          description="International flight check-in closes 1 hour before departure."
          buttonLabel="Open Trip"
        />

        <section className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-xl font-semibold">Lagos Work Trip</h2>
            <p className="mt-1 text-sm text-white/70">
              May 03 → May 07 • 1 traveler
            </p>
          </div>
        </section>
      </PageContainer>
    </main>
  );
}