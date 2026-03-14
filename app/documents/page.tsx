import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { FadeUp } from "@/components/motion/FadeUp";
import { StaggerList, StaggerItem } from "@/components/motion/StaggerList";
import { DocumentCategoryIcon, categoryLabel } from "@/components/documents/DocumentCategoryIcon";
import { getAllDocuments } from "@/lib/documents";

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function fileTypeLabel(mimeType: string | null | undefined): string | null {
  if (!mimeType) return null;
  const map: Record<string, string> = {
    "application/pdf": "PDF",
    "image/jpeg": "JPEG",
    "image/jpg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WebP",
    "image/heic": "HEIC",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  };
  return map[mimeType] ?? mimeType.split("/")[1]?.toUpperCase() ?? null;
}

export default async function DocumentsPage() {
  const documents = await getAllDocuments();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <PageContainer>
        <FadeUp>
          <div className="mb-2">
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

        {documents.length > 0 ? (
          <StaggerList className="space-y-3">
            {documents.map((doc) => {
              const fileType = fileTypeLabel(doc.mime_type);
              const displayName = doc.file_name ?? null;

              return (
                <StaggerItem key={doc.id}>
                  <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <DocumentCategoryIcon category={doc.category} />
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-medium text-white/80">
                            {doc.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-white/30">
                            {categoryLabel(doc.category)}
                            {doc.uploaded_at
                              ? ` · ${formatDate(doc.uploaded_at)}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      {/* File type chip */}
                      <span className="flex-shrink-0 rounded-full border border-white/[0.07] px-2 py-0.5 text-[10px] text-white/28">
                        {fileType ?? (doc.file_url ? "File" : "No file")}
                      </span>
                    </div>

                    {/* Filename row — only shown when the OS filename differs from the title */}
                    {displayName && displayName !== doc.title && (
                      <p className="mt-2 truncate pl-[21px] text-[12px] text-white/25">
                        {displayName}
                      </p>
                    )}

                    {/* View link */}
                    {doc.file_url && (
                      <div className="mt-3 border-t border-white/[0.06] pt-3">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] text-white/35 transition-colors hover:text-white/60"
                        >
                          View file →
                        </a>
                      </div>
                    )}
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerList>
        ) : (
          <FadeUp delay={0.1}>
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-10 text-center">
              <p className="text-[15px] text-white/35">No documents yet</p>
              <p className="mt-2 text-[13px] text-white/25">
                Documents attached to your trips will appear here
              </p>
            </div>
          </FadeUp>
        )}
      </PageContainer>
    </main>
  );
}
