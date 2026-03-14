import type { DbDocument } from "@/lib/trip-documents";
import { DocumentCategoryIcon } from "./DocumentCategoryIcon";
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
        <ul className="space-y-2.5">
          {docs.map((doc) => (
            <li key={doc.id} className="flex items-center gap-2.5">
              <DocumentCategoryIcon category={doc.category} />
              <span className="min-w-0 flex-1 truncate text-[14px] text-white/60">
                {doc.name}
              </span>
              {doc.file_url ? (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 rounded-full border border-white/[0.07] px-2 py-0.5 text-[10px] text-white/28 transition-colors hover:text-white/50"
                >
                  View
                </a>
              ) : (
                <span className="flex-shrink-0 rounded-full border border-white/[0.07] px-2 py-0.5 text-[10px] text-white/20">
                  No file
                </span>
              )}
            </li>
          ))}
        </ul>
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
