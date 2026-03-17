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

        <header className="mb-7">
          {/* Status badge — shows what was computed from the stored dates */}
          <span className="inline-block rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-white/35">
            {trip.status}
          </span>
          <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.02em]">
            Edit trip
          </h1>
          <p className="mt-1 text-[14px] text-white/40">{trip.title}</p>
        </header>

        <TripEditForm trip={trip} action={updateTripAction} />
      </PageContainer>
    </main>
  );
}
