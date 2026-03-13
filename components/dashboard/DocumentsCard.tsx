import type { Document } from "@/types/document";
import { DocumentCategoryIcon } from "@/components/documents/DocumentCategoryIcon";

type DocumentsCardProps = {
  items: Document[];
};

// Read-only document list. For the interactive trip version (attach/detach/upload),
// use TripDocumentsPanel instead.
export function DocumentsCard({ items }: DocumentsCardProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      <p className="mb-3.5 text-[11px] uppercase tracking-[0.1em] text-white/35">
        Documents
      </p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2.5 text-[14px] text-white/60">
            <DocumentCategoryIcon category={item.category} />
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
