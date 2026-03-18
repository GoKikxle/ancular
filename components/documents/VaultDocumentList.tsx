"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DbDocument } from "@/lib/documents";
import { DocumentCategoryIcon, categoryLabel } from "./DocumentCategoryIcon";
import { deleteDocumentAction } from "@/app/documents/actions";

// ── Local helpers (mirrors page.tsx originals) ────────────────────────────────

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
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "DOCX",
  };
  return map[mimeType] ?? mimeType.split("/")[1]?.toUpperCase() ?? null;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function TrashIcon() {
  return (
    <svg width="12" height="13" viewBox="0 0 12 13" fill="none" aria-hidden="true">
      <path
        d="M1 3.5h10M4.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 3.5l.6 7.2a1 1 0 001 .8h4.8a1 1 0 001-.8L10 3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M4.5 6.5v3M7.5 6.5v3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Animation ─────────────────────────────────────────────────────────────────

// Stagger entrance — matches StaggerList/StaggerItem from components/motion/
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const confirmSlide = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.14, ease: [0.55, 0, 1, 0.45] as const },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  docs: DbDocument[];
};

/**
 * Interactive document list for the vault page.
 *
 * Each card has a trash icon trigger that slides in an inline two-step
 * confirmation. Confirmed deletion calls deleteDocumentAction which:
 *   - removes the file from Supabase Storage
 *   - deletes the documents row (cascades to trip_documents)
 *
 * This is a permanent vault delete — distinct from "Remove from trip" which
 * only removes the trip_documents link.
 */
export function VaultDocumentList({ docs }: Props) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [docErrors, setDocErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function requestConfirm(id: string) {
    setConfirmingId(id);
    // Clear any previous error for this doc when re-entering confirm flow.
    setDocErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function cancelConfirm() {
    setConfirmingId(null);
  }

  function handleDelete(doc: DbDocument) {
    setDeletingId(doc.id);
    setConfirmingId(null);
    startTransition(async () => {
      const result = await deleteDocumentAction(
        doc.id,
        doc.storage_path,
        doc.storage_bucket
      );

      if (result.error) {
        setDeletingId(null);
        setDocErrors((prev) => ({ ...prev, [doc.id]: result.error! }));
      }
      // On success: revalidatePath in the action re-renders the page without
      // this document. setDeletingId(null) is defensive for the unmount case.
      setDeletingId(null);
    });
  }

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      {docs.map((doc) => {
        const isConfirming = confirmingId === doc.id;
        const isDeleting = deletingId === doc.id && isPending;
        const errorMsg = docErrors[doc.id];
        const fileType = fileTypeLabel(doc.mime_type);
        const displayName = doc.file_name ?? null;

        const cardContent = (
          <>
            {/* ── Header row ─────────────────────────────────────────────── */}
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

              {/* Right: file type chip + trash trigger */}
              <div
                className="flex flex-shrink-0 items-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="rounded-full border border-white/[0.07] px-2 py-0.5 text-[10px] text-white/28">
                  {fileType ?? (doc.file_url ? "File" : "No file")}
                </span>

                {!isConfirming && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      requestConfirm(doc.id);
                    }}
                    disabled={isPending}
                    aria-label={`Delete "${doc.title}" from vault`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white/[0.28] transition-colors hover:text-white/50 active:text-red-400/70 disabled:opacity-30"
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            </div>

            {/* ── Filename row ───────────────────────────────────────────── */}
            {displayName && displayName !== doc.title && (
              <p className="mt-2 truncate pl-[21px] text-[12px] text-white/25">
                {displayName}
              </p>
            )}

            {/* ── Inline error ──────────────────────────────────────────── */}
            {errorMsg && (
              <p className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2 text-[12px] text-red-300">
                {errorMsg}
              </p>
            )}

            {/* ── Confirmation row — stopPropagation so it doesn't open file ─ */}
            <AnimatePresence initial={false}>
              {isConfirming && (
                <motion.div
                  key={`confirm-${doc.id}`}
                  variants={confirmSlide}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
                    <p className="text-[12px] text-white/35">
                      Delete permanently?
                    </p>
                    <div className="flex flex-shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={cancelConfirm}
                        className="rounded-full border border-white/[0.12] px-3 py-1.5 text-[12px] text-white/40 transition-colors hover:text-white/60"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc)}
                        className="rounded-full border border-red-500/25 bg-red-500/[0.09] px-3 py-1.5 text-[12px] font-medium text-red-400/80 transition-colors hover:bg-red-500/[0.16] hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        );

        const isClickable = doc.file_url && !isConfirming;
        const baseClassName = `rounded-3xl border bg-white/[0.04] p-4 transition-all duration-200 ease-out ${
          isDeleting
            ? "pointer-events-none opacity-35 border-white/[0.08]"
            : isConfirming
            ? "opacity-65 border-white/[0.08]"
            : "opacity-100"
        }`;

        const interactiveClassName = isClickable
          ? [
              "cursor-pointer",
              "border-white/[0.11]",
              "hover:border-white/[0.18] hover:bg-white/[0.07]",
              "active:scale-[0.998] active:bg-white/[0.09]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
            ].join(" ")
          : "border-white/[0.08]";

        return (
          <motion.div key={doc.id} variants={cardVariants}>
            {doc.file_url && !isConfirming ? (
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block ${baseClassName} ${interactiveClassName}`}
              >
                {cardContent}
              </a>
            ) : (
              <div className={`${baseClassName} ${interactiveClassName}`}>
                {cardContent}
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
