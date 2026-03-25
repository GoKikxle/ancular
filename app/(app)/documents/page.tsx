import { PageContainer } from "@/components/layout/PageContainer";
import { VaultScreenClient } from "@/components/documents/VaultScreenClient";
import { getAllDocuments } from "@/lib/documents";
import { getAllTrips } from "@/lib/trips";
import { screenEyebrow, screenHeaderWrap, screenSubtitle, screenTitle } from "@/lib/screen-styles";

export default async function DocumentsPage() {
  const [documents, trips] = await Promise.all([getAllDocuments(), getAllTrips()]);
  const tripOptions = trips.map((t) => ({ id: t.id, slug: t.slug, title: t.title }));

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

        <VaultScreenClient documents={documents} trips={tripOptions} />
      </PageContainer>
    </main>
  );
}
