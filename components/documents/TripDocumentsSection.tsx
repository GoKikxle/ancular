import type { DbDocument } from "@/lib/trip-documents";
import { TripDocumentList } from "./TripDocumentList";
import { AttachDocumentPicker } from "./AttachDocumentPicker";
import { UploadDocumentForm } from "./UploadDocumentForm";

type Props = {
  tripId: string;
  tripSlug: string;
  docs: DbDocument[];
  /** Vault documents not yet attached to this trip — passed to the attach picker. */
  availableDocs: DbDocument[];
};

export function TripDocumentsSection({
  tripId,
  tripSlug,
  docs,
  availableDocs,
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
        />
        <UploadDocumentForm tripId={tripId} tripSlug={tripSlug} />
      </div>
    </section>
  );
}
