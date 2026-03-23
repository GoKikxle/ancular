import { notFound } from "next/navigation";
import { getDocumentById } from "@/lib/documents";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import Link from "next/link";

type DocumentViewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentViewPage({ params }: DocumentViewPageProps) {
  const { id } = await params;
  const doc = await getDocumentById(id);

  if (!doc) {
    notFound();
  }

  return (
    <main className="fixed inset-0 z-50 flex flex-col bg-neutral-950 text-white">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 pt-[calc(0.5rem+var(--safe-area-top))]">
        <Link
          href="/documents"
          className="flex items-center gap-1.5 text-[14px] text-white/70 transition-colors hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-center text-[15px] font-medium" title={doc.title}>
          {doc.title}
        </h1>
        <div className="w-[52px]" />
      </div>

      <div className="flex-1 overflow-hidden">
        <DocumentViewer doc={doc} />
      </div>
    </main>
  );
}
