import { PageContainer } from "@/components/layout/PageContainer";
import { BackButton } from "@/components/layout/BackButton";
import { TripForm } from "@/components/trips/TripForm";
import { FadeUp } from "@/components/motion/FadeUp";
import { createTrip } from "@/app/trips/actions";

export default function NewTripPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <PageContainer>
        <FadeUp>
          <BackButton href="/" label="All Trips" />

          <header className="mb-8">
            <p className="mb-1 text-[11px] uppercase tracking-[0.1em] text-white/35">
              New
            </p>
            <h1 className="text-[28px] font-semibold tracking-[-0.02em]">
              Create Trip
            </h1>
            <p className="mt-2 text-[14px] text-white/40">
              Add the basics. You can fill in details later.
            </p>
          </header>
        </FadeUp>

        <TripForm action={createTrip} />
      </PageContainer>
    </main>
  );
}
