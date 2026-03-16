import type { DbDocument } from "@/lib/trip-documents";
import type { TripDateContext } from "@/lib/document-to-timeline";
import { TripDocumentList } from "./TripDocumentList";
import { AttachDocumentPicker } from "./AttachDocumentPicker";
import { UploadDocumentForm } from "./UploadDocumentForm";

type Props = {
  tripId: string;
  tripSlug: string;
  docs: DbDocument[];
  /** Vault documents not yet attached to this trip — passed to the attach picker. */
  availableDocs: DbDocument[];
  /**
   * Trip start/end dates forwarded to the document pickers so that
   * auto-generated timeline items receive a real event_date instead of null.
   */
  tripDates?: TripDateContext;
};

export function TripDocumentsSection({
  tripId,
  tripSlug,
  docs,
  availableDocs,
  tripDates,
}: Props) {
  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      <p className="mb-4 text-[11px] uppercase tracking-[0.1em] text-white/35">
        Documents
      </p>

      {docs.length > 0 ? (
        <TripDocumentList docs={docs} tripId={tripId} tripSlug={tripSlug} />
      ) : (
        <p className="text-[13px] text-white/28">
          No documents attached to this trip yet.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
        <AttachDocumentPicker
          tripId={tripId}
          tripSlug={tripSlug}
          availableDocs={availableDocs}
          tripDates={tripDates}
        />
        <UploadDocumentForm tripId={tripId} tripSlug={tripSlug} tripDates={tripDates} />
      </div>
    </section>
  );
}
