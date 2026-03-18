import { PageContainer } from "@/components/layout/PageContainer";
import { TripSwitcher } from "@/components/trips/TripSwitcher";
import { CurrentTripCard } from "@/components/trips/CurrentTripCard";
import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { FadeUp } from "@/components/motion/FadeUp";
import { StaggerList, StaggerItem } from "@/components/motion/StaggerList";
import { getTrips } from "@/lib/trips-store";

export default function DashboardPage() {
  const trips = getTrips();
  const activeTrip = trips.find((t) => t.status === "Active") ?? trips[0];

  if (!activeTrip) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white">
        <PageContainer>
          <FadeUp>
            <p className="text-[14px] text-white/40">No trips found.</p>
          </FadeUp>
        </PageContainer>
      </main>
    );
  }

  const otherTrips = trips.filter((t) => t.id !== activeTrip.id);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <PageContainer>
        <FadeUp>
          <header className="mb-7">
            <p className="mb-1 text-[11px] uppercase tracking-[0.1em] text-white/35">
              Dashboard
            </p>
            <h1 className="text-[28px] font-semibold tracking-[-0.02em]">
              Your Trips
            </h1>
          </header>
        </FadeUp>

        <FadeUp delay={0.06}>
          <TripSwitcher trips={trips} currentSlug={activeTrip.slug} />
        </FadeUp>

        <FadeUp delay={0.1}>
          <CurrentTripCard
            title={activeTrip.title}
            dates={activeTrip.dates}
            travelers={activeTrip.travelers}
            status={activeTrip.status}
            href={`/trips/${activeTrip.slug}`}
          />
        </FadeUp>

        {activeTrip.nextActionTitle && (
          <FadeUp delay={0.14}>
            <NextActionCard
              title={activeTrip.nextActionTitle}
              description={activeTrip.nextActionDescription}
              buttonLabel="Open Trip Timeline"
              buttonHref={`/trips/${activeTrip.slug}#timeline`}
            />
          </FadeUp>
        )}

        {otherTrips.length > 0 && (
          <>
            <FadeUp delay={0.18}>
              <p className="mb-3 mt-6 text-[11px] uppercase tracking-[0.1em] text-white/30">
                Other Trips
              </p>
            </FadeUp>
            <StaggerList className="space-y-3">
              {otherTrips.map((trip) => (
                <StaggerItem key={trip.id}>
                  <CurrentTripCard
                    title={trip.title}
                    dates={trip.dates}
                    travelers={trip.travelers}
                    status={trip.status}
                    href={`/trips/${trip.slug}`}
                  />
                </StaggerItem>
              ))}
            </StaggerList>
          </>
        )}
      </PageContainer>
    </main>
  );
}
