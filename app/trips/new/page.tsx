import { PageContainer } from "@/components/layout/PageContainer";
import { BackButton } from "@/components/layout/BackButton";
import { TripForm } from "@/components/trips/TripForm";
import { createTrip } from "@/app/trips/actions";

export default function NewTripPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <BackButton href="/" label="All Trips" />

        <header className="mb-8">
          <p className="text-sm text-white/50">New</p>
          <h1 className="text-3xl font-semibold tracking-tight">Create Trip</h1>
        </header>

        <TripForm action={createTrip} />
      </PageContainer>
    </main>
  );
}
