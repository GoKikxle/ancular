import { PrimaryActionCard } from "@/components/dashboard/PrimaryActionCard";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { ItineraryGenerator } from "@/components/dashboard/ItineraryGenerator";
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

        {/* 2 — Full itinerary with action grouping (Next / Up next / Later)
             id="timeline" here so the anchor always resolves even when
             TimelineCard renders nothing (empty trip). */}
        <div id="timeline" className="mb-4 space-y-3">
          <TimelineCard items={timelineItems} />
          <ItineraryGenerator
            tripId={trip.id}
            tripSlug={trip.slug}
            tripTitle={trip.title}
            tripDates={trip.dates}
            weatherSummary={trip.weather_summary}
            weatherNote={trip.weather_note}
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
          />
        </div>

        {/* 4 — Weather */}
        <div className="mb-4">
          <TripWeatherCard
            summary={trip.weather_summary}
            note={trip.weather_note}
          />
        </div>

        {/* 5 — Contextual suggestions (visually deprioritized — secondary read) */}
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
