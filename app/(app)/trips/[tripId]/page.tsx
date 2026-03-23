import Link from "next/link";
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
import { getWeatherForDestination } from "@/lib/weather";
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
  // Weather is fetched live when destination exists — not stored in DB.
  const [timelineItems, tripDocs, allDocs, weatherResult] = await Promise.all([
    getTimelineItemsForTrip(trip.id),
    getDocumentsForTrip(trip.id),
    getAllDocuments(),
    getWeatherForDestination(trip.destination),
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

  // Resolve the file URL for the "View file" CTA.
  // Only populated when the primary timeline item has a document_id that matches
  // a document currently attached to this trip (has a stored signed URL).
  const primaryActionFileUrl =
    primaryAction.documentId
      ? (tripDocs.find((d) => d.id === primaryAction.documentId)?.file_url ?? null)
      : null;

  // Contextual suggestions — use live weather when available, else fall back to DB fields.
  const suggestions = getSuggestionsForTrip({
    tripTitle: trip.title,
    tripDates: trip.dates,
    weatherSummary: weatherResult.ok ? weatherResult.summary : trip.weather_summary,
    weatherNote: weatherResult.ok ? weatherResult.note : trip.weather_note,
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
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
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

            {/* Edit button — pencil icon + label for easy tap target on mobile */}
            <Link
              href={`/trips/${trip.slug}/edit`}
              className="mt-1.5 inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.05] px-3 py-2 text-[12px] font-medium text-white/50 transition-colors hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-white/75"
            >
              {/* Pencil icon */}
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <path
                  d="M7.8 1.2a1.13 1.13 0 011.6 1.6L3.6 8.6 1 9.5 1.9 7 7.8 1.2z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Edit
            </Link>
          </div>
        </header>

        {/* 1 — Primary action hero
             Answers: what next, when, which document.
             CTA scrolls to #documents when documents exist. */}
        <PrimaryActionCard {...primaryAction} fileUrl={primaryActionFileUrl} />

        {/* 2 — Timeline + manual action entry
             id="timeline" lives here so the PrimaryActionCard CTA anchor
             always resolves, even when TimelineCard renders nothing.
             tripDocs is passed so document selectors in both forms can show
             the documents already attached to this trip. */}
        <div id="timeline" className="mb-4 space-y-3">
          <TimelineCard
            items={timelineItems}
            tripSlug={trip.slug}
            hasDocuments={tripDocs.length > 0}
            tripDocs={tripDocs.map((d) => ({ id: d.id, title: d.title, category: d.category, file_url: d.file_url }))}
          />
          <AddActionForm
            tripId={trip.id}
            tripSlug={trip.slug}
            hasExistingItems={timelineItems.length > 0}
            tripDocs={tripDocs.map((d) => ({ id: d.id, title: d.title, category: d.category, file_url: d.file_url }))}
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

        {/* 4 — Weather: always rendered.
             Live weather via Open-Meteo when destination exists.
             Fallbacks for missing destination, geocode failure, or weather fetch failure. */}
        <div className="mb-4">
          <TripWeatherCard
            weatherResult={weatherResult}
            destination={trip.destination}
            editHref={`/trips/${trip.slug}/edit`}
          />
        </div>

        {/* 5 — Good to Know: supportive travel context (tips, reminders, local awareness).
             Informational only — no add-to-timeline. Tap card to read full text.
             Visually secondary: rendered last, low-opacity styling. */}
        <TripSuggestionsCard
          suggestions={suggestions}
          tripTitle={trip.title}
        />
      </PageContainer>
    </main>
  );
}
