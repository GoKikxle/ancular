"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DbDocument } from "@/lib/documents";
import { VaultDocumentList } from "@/components/documents/VaultDocumentList";
import { VaultAddDocumentPanel, type VaultTripOption } from "@/components/documents/VaultAddDocumentPanel";
import { SearchInput } from "@/components/ui/SearchInput";
import { categoryLabel } from "@/components/documents/DocumentCategoryIcon";
import type { DocumentCategory } from "@/types/document";
import { surfaceCardLight } from "@/lib/screen-styles";

function filterDocuments(docs: DbDocument[], query: string): DbDocument[] {
  const s = query.trim().toLowerCase();
  if (!s) return docs;
  return docs.filter((d) => {
    const cat = categoryLabel(d.category as DocumentCategory).toLowerCase();
    return (
      d.title.toLowerCase().includes(s) ||
      (d.file_name ?? "").toLowerCase().includes(s) ||
      cat.includes(s)
    );
  });
}

function VaultPlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

type Props = {
  documents: DbDocument[];
  trips: VaultTripOption[];
};

export function VaultScreenClient({ documents, trips }: Props) {
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const filtered = useMemo(() => filterDocuments(documents, q), [documents, q]);
  const searching = q.trim().length > 0;
  const noMatches = searching && filtered.length === 0;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center gap-[8px]">
          <div className="min-w-0 flex-1">
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder="Search by title, file, or category"
              label="Search documents"
              className=""
            />
          </div>
          <button
            type="button"
            onClick={() => setAddOpen((o) => !o)}
            aria-label={addOpen ? "Close add document" : "Add document"}
            aria-expanded={addOpen}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] border border-[#E5E5E5] bg-white text-[#666666] shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-colors hover:border-[#D8D8D8] hover:bg-[#FAFAFA] active:scale-[0.96] dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white/65 dark:shadow-none dark:hover:bg-white/[0.08]"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <VaultPlusIcon />
          </button>
        </div>
        {addOpen ? <VaultAddDocumentPanel trips={trips} onClose={() => setAddOpen(false)} /> : null}
      </div>

      {documents.length === 0 && !searching ? (
        <div className={`${surfaceCardLight} px-6 py-10 text-center`}>
          <p className="text-[16px] font-semibold text-[#111111] dark:text-white">No documents yet</p>
          <p className="mx-auto mt-2 max-w-[280px] text-[14px] leading-relaxed text-[#9A9A9A] dark:text-white/45">
            {trips.length > 0
              ? "Tap + to add a document, or upload from a trip."
              : "Create a trip, then add documents from the trip or here."}
          </p>
          <Link
            href="/trips"
            className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-[12px] bg-[#111111] px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#222222] active:scale-[0.98] dark:bg-white dark:text-neutral-950 dark:hover:bg-white/90"
          >
            Go to trips
          </Link>
        </div>
      ) : noMatches ? (
        <div className={`${surfaceCardLight} px-6 py-10 text-center`}>
          <p className="text-[16px] font-semibold text-[#111111] dark:text-white">No matching documents</p>
          <p className="mx-auto mt-2 max-w-[260px] text-[14px] text-[#9A9A9A] dark:text-white/45">
            Try another search term.
          </p>
        </div>
      ) : (
        <VaultDocumentList docs={filtered} />
      )}
    </>
  );
}
