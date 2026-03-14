import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { TripDocumentsSection } from "@/components/documents/TripDocumentsSection";
import { PageContainer } from "@/components/layout/PageContainer";
import { BackButton } from "@/components/layout/BackButton";
import { getTripBySlug } from "@/lib/trips";
import { getTimelineItemsForTrip } from "@/lib/timeline-items";
import { getDocumentsForTrip } from "@/lib/trip-documents";
import { getAllDocuments } from "@/lib/documents";
import { notFound } from "next/navigation";
import { deleteTripAction } from "@/app/trips/actions";

type TripDetailPageProps = {
  params: Promise<{
    tripId: string;
  }>;
};

export default async function TripDetailPage({
  params,
}: TripDetailPageProps) {
  const { tripId } = await params;
  const trip = await getTripBySlug(tripId);

  if (!trip) {
    notFound();
  }

  // tripId in the URL is the slug; use trip.id (UUID) for all FK lookups.
  const [timelineItems, tripDocs, allDocs] = await Promise.all([
    getTimelineItemsForTrip(trip.id),
    getDocumentsForTrip(trip.id),
    getAllDocuments(),
  ]);

  // Documents in the vault that are not yet attached to this trip.
  const attachedIds = new Set(tripDocs.map((d) => d.id));
  const availableDocs = allDocs.filter((d) => !attachedIds.has(d.id));

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <div className="mb-6">
          <BackButton href="/" label="Back to trips" />
        </div>

        <header className="mb-8">
          <p className="text-sm text-white/50">Trip Overview</p>
          <h1 className="text-3xl font-semibold tracking-tight">{trip.title}</h1>
          <p className="mt-2 text-sm text-white/70">
            {trip.dates} • {trip.travelers}
          </p>
        </header>

        <NextActionCard
          title={trip.next_action_title}
          description={trip.next_action_description}
          buttonLabel="Open Timeline"
          buttonHref="#timeline"
        />

        <TimelineCard items={timelineItems} />

        <TripDocumentsSection
          tripId={trip.id}
          tripSlug={trip.slug}
          docs={tripDocs}
          availableDocs={availableDocs}
        />
      </PageContainer>
    </main>
  );
}