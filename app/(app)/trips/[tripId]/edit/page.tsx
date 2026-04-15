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
    <main className="min-h-full bg-[#F8F8F8] pb-28 text-[#111111] dark:bg-neutral-950 dark:text-white">
      <PageContainer className="pb-8 pt-1">
        <div className="mb-6">
          <BackButton href={`/trips/${trip.slug}`} label="Back to trip" variant="light" />
        </div>

        <header className="mb-7">
          <span className="inline-block rounded-xl border border-[#EBEBEB] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9A9A9A] shadow-[0_1px_0_rgba(0,0,0,0.02)] dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white/40">
            {trip.status}
          </span>
          <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-white">
            Edit trip
          </h1>
          <p className="mt-1.5 text-[14px] text-[#9A9A9A] dark:text-white/45">{trip.title}</p>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[14px] text-red-600 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
            {decodeURIComponent(error)}
          </div>
        )}

        <TripEditForm trip={trip} action={updateTripAction} />

        <div className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#EBEBEB] dark:bg-white/[0.08]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#AAAAAA] dark:text-white/30">
              Danger zone
            </span>
            <div className="h-px flex-1 bg-[#EBEBEB] dark:bg-white/[0.08]" />
          </div>

          <TripActions tripId={trip.id} deleteAction={deleteTripAction} />
        </div>
      </PageContainer>
    </main>
  );
}
