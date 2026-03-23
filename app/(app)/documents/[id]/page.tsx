import { notFound } from "next/navigation";
import { getDocumentById } from "@/lib/documents";
import { DocumentViewer } from "@/components/documents/DocumentViewer";

type DocumentViewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentViewPage({ params }: DocumentViewPageProps) {
  const { id } = await params;
  const doc = await getDocumentById(id);

  if (!doc) {
    notFound();
  }

  return <DocumentViewer doc={doc} />;
}
