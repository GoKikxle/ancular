import { NextEventCard } from "@/components/dashboard/NextEventCard";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { TripWeatherCard } from "@/components/dashboard/TripWeatherCard";
import { SuggestedActivitiesCard } from "@/components/dashboard/SuggestedActivitiesCard";
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

  /**
   * Compute "next event":
   * — If timeline items exist, use the first one (ordered by sort_order ascending).
   * — Otherwise fall back to the trip's next_action fields.
   */
  const firstItem = timelineItems[0] ?? null;
  const nextEvent = firstItem
    ? {
        label: "Up Next",
        time: firstItem.time,
        title: firstItem.title,
        description: firstItem.note || trip.next_action_description,
        buttonLabel: "View Itinerary",
        buttonHref: "#timeline",
      }
    : {
        label: "Next Action",
        time: null,
        title: trip.next_action_title,
        description: trip.next_action_description,
        buttonLabel: "Open Timeline",
        buttonHref: "#timeline",
      };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        {/* Back nav */}
        <div className="mb-6">
          <BackButton href="/" label="Back to trips" />
        </div>

        {/* Trip header */}
        <header className="mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-white/35">
                {trip.status}
              </p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">
                {trip.title}
              </h1>
              <p className="mt-1.5 text-[13px] text-white/50">
                {trip.dates}
                {trip.travelers ? ` · ${trip.travelers}` : ""}
              </p>
            </div>
          </div>
        </header>

        {/* 1 — Next event hero card */}
        <NextEventCard
          label={nextEvent.label}
          time={nextEvent.time}
          title={nextEvent.title}
          description={nextEvent.description}
          buttonLabel={nextEvent.buttonLabel}
          buttonHref={nextEvent.buttonHref}
        />

        {/* 2 — Smart itinerary / timeline */}
        <div className="mb-4">
          <TimelineCard items={timelineItems} />
        </div>

        {/* 3 — Documents */}
        <div className="mb-4">
          <TripDocumentsSection
            tripId={trip.id}
            tripSlug={trip.slug}
            docs={tripDocs}
            availableDocs={availableDocs}
          />
        </div>

        {/* 4 — Weather */}
        <div className="mb-4">
          <TripWeatherCard
            summary={trip.weather_summary}
            note={trip.weather_note}
          />
        </div>

        {/* 5 — Suggested activities placeholder */}
        <SuggestedActivitiesCard tripTitle={trip.title} />
      </PageContainer>
    </main>
  );
}
