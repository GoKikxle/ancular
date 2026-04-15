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

type Props = {
  documents: DbDocument[];
  trips: VaultTripOption[];
};

export function VaultScreenClient({ documents, trips }: Props) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => filterDocuments(documents, q), [documents, q]);
  const searching = q.trim().length > 0;
  const noMatches = searching && filtered.length === 0;

  return (
    <>
      <SearchInput
        value={q}
        onChange={setQ}
        placeholder="Search by title, file, or category"
        label="Search documents"
        className="mb-5"
      />

      <VaultAddDocumentPanel trips={trips} />

      {documents.length === 0 && !searching ? (
        <div className={`${surfaceCardLight} px-6 py-10 text-center`}>
          <p className="text-[16px] font-semibold text-[#111111] dark:text-white">No documents yet</p>
          <p className="mx-auto mt-2 max-w-[280px] text-[14px] leading-relaxed text-[#9A9A9A] dark:text-white/45">
            {trips.length > 0
              ? "Use Add document above, or upload from a trip."
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
