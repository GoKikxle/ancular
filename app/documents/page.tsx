import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { FadeUp } from "@/components/motion/FadeUp";
import { StaggerList, StaggerItem } from "@/components/motion/StaggerList";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { getDocuments, getTripIdsForDocument } from "@/lib/documents-store";
import { getTrips } from "@/lib/trips-store";

export default function DocumentsPage() {
  const documents = getDocuments();
  const allTrips = getTrips();

  // Enrich each document with its attached trips for display.
  const enriched = documents.map((doc) => {
    const tripIds = getTripIdsForDocument(doc.id);
    const attachedTrips = tripIds
      .map((id) => allTrips.find((t) => t.id === id))
      .filter((t): t is NonNullable<typeof t> => t !== undefined);
    return { doc, attachedTrips };
  });

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <PageContainer>
        <FadeUp>
          <div className="mb-2 flex items-center gap-2">
            <Link
              href="/"
              className="text-[13px] text-white/35 transition-colors hover:text-white/55"
            >
              ← Trips
            </Link>
          </div>

          <header className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-[0.1em] text-white/35">
                Vault
              </p>
              <h1 className="text-[28px] font-semibold tracking-[-0.02em]">
                Documents
              </h1>
              <p className="mt-1.5 text-[14px] text-white/40">
                {documents.length} document{documents.length !== 1 ? "s" : ""} stored
              </p>
            </div>
          </header>
        </FadeUp>

        {enriched.length > 0 ? (
          <StaggerList className="space-y-3">
            {enriched.map(({ doc, attachedTrips }) => (
              <StaggerItem key={doc.id}>
                <DocumentCard document={doc} attachedTrips={attachedTrips} />
              </StaggerItem>
            ))}
          </StaggerList>
        ) : (
          <FadeUp delay={0.1}>
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-10 text-center">
              <p className="text-[15px] text-white/35">No documents yet</p>
              <p className="mt-2 text-[13px] text-white/25">
                Upload documents from a trip page
              </p>
            </div>
          </FadeUp>
        )}
      </PageContainer>
    </main>
  );
}
