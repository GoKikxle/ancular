import { TripEditForm } from "@/components/trips/TripEditForm";
import { TripActions } from "@/components/trips/TripActions";
import { PageContainer } from "@/components/layout/PageContainer";
import { BackButton } from "@/components/layout/BackButton";
import { getTripBySlug } from "@/lib/trips";
import { updateTripAction, deleteTripAction } from "@/app/(app)/trips/actions";
import { notFound } from "next/navigation";

type EditTripPageProps = {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditTripPage({ params, searchParams }: EditTripPageProps) {
  const { tripId } = await params;
  const { error } = await searchParams;
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

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[14px] text-red-300">
            {decodeURIComponent(error)}
          </div>
        )}

        {/* ── Edit fields ────────────────────────────────────────────────────── */}
        <TripEditForm trip={trip} action={updateTripAction} />

        {/* ── Danger zone ────────────────────────────────────────────────────── */}
        <div className="mt-10">
          {/* Thin rule + section label */}
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/20">
              Danger zone
            </span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <TripActions tripId={trip.id} deleteAction={deleteTripAction} />
        </div>
      </PageContainer>
    </main>
  );
}
