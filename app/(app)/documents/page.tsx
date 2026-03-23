import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { VaultDocumentList } from "@/components/documents/VaultDocumentList";
import { getAllDocuments } from "@/lib/documents";
import {
  screenEyebrow,
  screenHeaderWrap,
  screenSubtitle,
  screenTitle,
  surfaceCard,
} from "@/lib/screen-styles";

export default async function DocumentsPage() {
  const documents = await getAllDocuments();

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <header className={screenHeaderWrap}>
          <p className={screenEyebrow}>Vault</p>
          <h1 className={screenTitle}>Documents</h1>
          <p className={screenSubtitle}>
            {documents.length} document{documents.length !== 1 ? "s" : ""} stored
          </p>
        </header>

        {documents.length > 0 ? (
          <VaultDocumentList docs={documents} />
        ) : (
          <div className={`${surfaceCard} px-6 py-10 text-center`}>
            <p className="text-[16px] font-semibold text-white/80">No documents yet</p>
            <p className="mx-auto mt-2 max-w-[280px] text-[14px] leading-relaxed text-white/45">
              Upload files from a trip—they&apos;ll show up here in your vault.
            </p>
            <Link
              href="/trips"
              className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-6 py-3 text-[14px] font-semibold text-neutral-950 transition-opacity hover:opacity-95 active:scale-[0.98]"
            >
              Go to trips
            </Link>
          </div>
        )}
      </PageContainer>
    </main>
  );
}
