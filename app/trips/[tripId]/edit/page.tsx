import { TripEditForm } from "@/components/trips/TripEditForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { BackButton } from "@/components/layout/BackButton";
import { getTripBySlug } from "@/lib/trips";
import { updateTripAction } from "@/app/trips/actions";
import { notFound } from "next/navigation";

type EditTripPageProps = {
  params: Promise<{ tripId: string }>;
};

export default async function EditTripPage({ params }: EditTripPageProps) {
  const { tripId } = await params;
  const trip = await getTripBySlug(tripId);

  if (!trip) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <div className="mb-6">
          <BackButton href={`/trips/${trip.slug}`} label="Back to trip" />
        </div>

        <header className="mb-6">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
            Edit trip
          </h1>
          <p className="mt-1 text-[13px] text-white/40">{trip.title}</p>
        </header>

        <TripEditForm trip={trip} action={updateTripAction} />
      </PageContainer>
    </main>
  );
}
