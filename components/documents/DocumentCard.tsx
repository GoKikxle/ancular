import type { Document } from "@/types/document";
import type { Trip } from "@/types/trip";
import { DocumentCategoryIcon, categoryLabel } from "./DocumentCategoryIcon";

type DocumentCardProps = {
  document: Document;
  attachedTrips: Trip[];
};

export function DocumentCard({ document, attachedTrips }: DocumentCardProps) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <DocumentCategoryIcon category={document.category} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-white/80">
              {document.name}
            </p>
            <p className="mt-0.5 text-[11px] text-white/30">
              {categoryLabel(document.category)} · {document.uploadedAt}
            </p>
          </div>
        </div>

        {/* File status chip */}
        <span className="flex-shrink-0 rounded-full border border-white/[0.07] px-2 py-0.5 text-[10px] text-white/28">
          {document.fileUrl ? "File attached" : "No file"}
        </span>
      </div>

      {/* Attached trips */}
      {attachedTrips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/[0.06] pt-3">
          {attachedTrips.map((trip) => (
            <span
              key={trip.id}
              className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-0.5 text-[11px] text-white/40"
            >
              {trip.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
