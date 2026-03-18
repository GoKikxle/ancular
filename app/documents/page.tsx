import { PageContainer } from "@/components/layout/PageContainer";
import { VaultDocumentList } from "@/components/documents/VaultDocumentList";
import { getAllDocuments } from "@/lib/documents";

export default async function DocumentsPage() {
  const documents = await getAllDocuments();

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <header className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/35">
            Vault
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">
            Documents
          </h1>
          <p className="mt-1.5 text-[14px] text-white/40">
            {documents.length} document{documents.length !== 1 ? "s" : ""} stored
          </p>
        </header>

        {documents.length > 0 ? (
          <VaultDocumentList docs={documents} />
        ) : (
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-10 text-center">
            <p className="text-[15px] font-medium text-white/50">
              No documents yet
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/35">
              Documents attached to your trips will appear here
            </p>
          </div>
        )}
      </PageContainer>
    </main>
  );
}
