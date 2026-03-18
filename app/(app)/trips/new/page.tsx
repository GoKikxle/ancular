import { createTripAction } from "@/app/(app)/trips/actions";
import { PageContainer } from "@/components/layout/PageContainer";
import { BackButton } from "@/components/layout/BackButton";
import { TripForm } from "@/components/trips/TripForm";

export default function NewTripPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <div className="mb-6">
          <BackButton href="/" label="Back to trips" />
        </div>

        <header className="mb-8">
          <p className="text-sm text-white/50">Create a Trip</p>
          <h1 className="text-3xl font-semibold tracking-tight">New Trip</h1>
        </header>

        <TripForm action={createTripAction} />
      </PageContainer>
    </main>
  );
}