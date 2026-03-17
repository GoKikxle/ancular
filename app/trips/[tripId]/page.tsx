import { PrimaryActionCard } from "@/components/dashboard/PrimaryActionCard";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { AddActionForm } from "@/components/dashboard/AddActionForm";
// ItineraryGenerator is preserved in components/dashboard/ItineraryGenerator.tsx
// and can be re-enabled here when AI itinerary becomes a primary feature again.
import { TripWeatherCard } from "@/components/dashboard/TripWeatherCard";
import { TripSuggestionsCard } from "@/components/dashboard/TripSuggestionsCard";
import { TripDocumentsSection } from "@/components/documents/TripDocumentsSection";
import { PageContainer } from "@/components/layout/PageContainer";
import { BackButton } from "@/components/layout/BackButton";
import { getTripBySlug } from "@/lib/trips";
import { getTimelineItemsForTrip } from "@/lib/timeline-items";
import { getDocumentsForTrip } from "@/lib/trip-documents";
import { getAllDocuments } from "@/lib/documents";
import { getSuggestionsForTrip } from "@/lib/trip-suggestions";
import { buildPrimaryActionView } from "@/lib/timeline-view-model";
import { notFound } from "next/navigation";

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

  // Documents in the vault not yet attached to this trip.
  const attachedIds = new Set(tripDocs.map((d) => d.id));
  const availableDocs = allDocs.filter((d) => !attachedIds.has(d.id));

  // Build the Primary Action hero data from the first timeline item (or fallback).
  const primaryAction = buildPrimaryActionView(
    timelineItems,
    {
      nextActionTitle: trip.next_action_title,
      nextActionDescription: trip.next_action_description,
    },
    tripDocs.length > 0
  );

  // Contextual suggestions — pure, no DB call.
  const suggestions = getSuggestionsForTrip({
    tripTitle: trip.title,
    tripDates: trip.dates,
    weatherSummary: trip.weather_summary,
    weatherNote: trip.weather_note,
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        {/* Back nav */}
        <div className="mb-6">
          <BackButton href="/" label="Back to trips" />
        </div>

        {/* Trip header */}
        <header className="mb-6">
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
        </header>

        {/* 1 — Primary action hero
             Answers: what next, when, which document.
             CTA scrolls to #documents when documents exist. */}
        <PrimaryActionCard {...primaryAction} />

        {/* 2 — Timeline + manual action entry
             id="timeline" lives here so the PrimaryActionCard CTA anchor
             always resolves, even when TimelineCard renders nothing. */}
        <div id="timeline" className="mb-4 space-y-3">
          <TimelineCard
            items={timelineItems}
            tripSlug={trip.slug}
            hasDocuments={tripDocs.length > 0}
          />
          <AddActionForm
            tripId={trip.id}
            tripSlug={trip.slug}
            hasExistingItems={timelineItems.length > 0}
          />
        </div>

        {/* 3 — Documents
             id="documents" is the scroll target for the PrimaryActionCard CTA. */}
        <div id="documents" className="mb-4">
          <TripDocumentsSection
            tripId={trip.id}
            tripSlug={trip.slug}
            docs={tripDocs}
            availableDocs={availableDocs}
            tripDates={{
              startDate: trip.start_date,
              endDate: trip.end_date,
            }}
          />
        </div>

        {/* 4 — Weather: only rendered when real data exists.
             The placeholder "coming soon" card is omitted so it doesn't occupy
             visual space and compete with the primary booking-action content. */}
        {(trip.weather_summary || trip.weather_note) && (
          <div className="mb-4">
            <TripWeatherCard
              summary={trip.weather_summary}
              note={trip.weather_note}
            />
          </div>
        )}

        {/* 5 — Contextual suggestions.
             Kept for discoverability but visually deprioritized: rendered last,
             no mb-4 wrapper (tighter top gap), and the component itself already
             uses very low-opacity text tokens so it reads as secondary. */}
        <TripSuggestionsCard
          suggestions={suggestions}
          tripId={trip.id}
          tripSlug={trip.slug}
          tripTitle={trip.title}
        />
      </PageContainer>
    </main>
  );
}
