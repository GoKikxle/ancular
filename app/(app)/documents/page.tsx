import { PageContainer } from "@/components/layout/PageContainer";
import { VaultScreenClient } from "@/components/documents/VaultScreenClient";
import { getAllDocuments } from "@/lib/documents";
import { getAllTrips } from "@/lib/trips";
import {
  screenEyebrowLight,
  screenHeaderWrapLight,
  screenSubtitleLight,
  screenTitleLight,
} from "@/lib/screen-styles";

export default async function DocumentsPage() {
  const [documents, trips] = await Promise.all([getAllDocuments(), getAllTrips()]);
  const tripOptions = trips.map((t) => ({ id: t.id, slug: t.slug, title: t.title }));

  return (
    <main className="min-h-full bg-[#F8F8F8] pb-24 text-[#111111] dark:bg-neutral-950 dark:text-white">
      <PageContainer className="pb-6 pt-[22px]">
        <header className={screenHeaderWrapLight}>
          <p className={screenEyebrowLight}>Vault</p>
          <h1 className={screenTitleLight}>Documents</h1>
          <p className={screenSubtitleLight}>
            {documents.length} document{documents.length !== 1 ? "s" : ""} stored
          </p>
        </header>

        <VaultScreenClient documents={documents} trips={tripOptions} />
      </PageContainer>
    </main>
  );
}
