"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DbDocument } from "@/lib/documents";
import { surfaceCardLight, surfaceCardLightHover } from "@/lib/screen-styles";
import { DocumentCategoryIcon, categoryLabel } from "./DocumentCategoryIcon";
import { deleteDocumentAction, updateDocumentTitleAction } from "@/app/(app)/documents/actions";
import { VaultDocumentCardMenu } from "./VaultDocumentCardMenu";

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

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  docs: DbDocument[];
};

/**
 * Interactive document list for the vault page.
 *
 * Actions live in a ⋮ menu; delete uses a modal confirmation before
 * deleteDocumentAction, which:
 *   - removes the file from Supabase Storage
 *   - deletes the documents row (cascades to trip_documents)
 *
 * This is a permanent vault delete — distinct from "Remove from trip" which
 * only removes the trip_documents link.
 */
export function VaultDocumentList({ docs }: Props) {
  const router = useRouter();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<DbDocument | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [docErrors, setDocErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [editingDoc, setEditingDoc] = useState<DbDocument | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editPending, setEditPending] = useState(false);

  function openDeleteConfirm(doc: DbDocument) {
    setMenuOpenId(null);
    setDocErrors((prev) => {
      const next = { ...prev };
      delete next[doc.id];
      return next;
    });
    setDeleteConfirmDoc(doc);
  }

  function closeDeleteConfirm() {
    setDeleteConfirmDoc(null);
  }

  function openEdit(doc: DbDocument) {
    setEditingDoc(doc);
    setEditTitle(doc.title);
    setEditError(null);
  }

  function closeEdit() {
    setEditingDoc(null);
    setEditError(null);
    setEditPending(false);
  }

  useEffect(() => {
    if (!deleteConfirmDoc) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDeleteConfirmDoc(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [deleteConfirmDoc]);

  async function saveTitle() {
    if (!editingDoc) return;
    const trimmed = editTitle.trim();
    if (!trimmed) {
      setEditError("Title is required");
      return;
    }
    setEditPending(true);
    setEditError(null);
    const result = await updateDocumentTitleAction(editingDoc.id, trimmed);
    setEditPending(false);
    if (result.error) {
      setEditError(result.error);
      return;
    }
    closeEdit();
    router.refresh();
  }

  function handleDelete(doc: DbDocument) {
    closeDeleteConfirm();
    setDeletingId(doc.id);
    startTransition(async () => {
      const result = await deleteDocumentAction(
        doc.id,
        doc.storage_path,
        doc.storage_bucket
      );

      if (result.error) {
        setDocErrors((prev) => ({ ...prev, [doc.id]: result.error ?? "Unknown error" }));
      } else {
        router.refresh();
      }
      setDeletingId(null);
    });
  }

  return (
    <>
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-2.5"
    >
      {docs.map((doc) => {
        const isDeleting = deletingId === doc.id && isPending;
        const errorMsg = docErrors[doc.id];
        const fileType = fileTypeLabel(doc.mime_type);
        const displayName = doc.file_name ?? null;

        const cardContent = (
          <>
            {/* ── Header row ─────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <DocumentCategoryIcon category={doc.category} variant="onLight" />
                <div className="min-w-0">
                  <p className="truncate text-[17px] font-bold leading-snug tracking-[-0.02em] text-[#111111] dark:text-white">
                    {doc.title}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9A9A9A] dark:text-white/45">
                    {categoryLabel(doc.category)}
                    {doc.uploaded_at ? ` · ${formatDate(doc.uploaded_at)}` : ""}
                  </p>
                </div>
              </div>

              {/* Right: metadata chips + ⋮ menu */}
              <div
                className="flex flex-shrink-0 items-start gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                {(doc.available_offline ?? false) && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300/95">
                    Offline
                  </span>
                )}
                  <span className="mt-0.5 rounded-full border border-[#EBEBEB] bg-[#F8F8F8] px-2 py-0.5 text-[10px] font-medium text-[#666666] dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-white/50">
                  {fileType ?? (doc.file_url ? "File" : "No file")}
                </span>

                <VaultDocumentCardMenu
                  docTitle={doc.title}
                  isOpen={menuOpenId === doc.id}
                  onOpenChange={(open) => setMenuOpenId(open ? doc.id : null)}
                  onEditTitle={() => openEdit(doc)}
                  onDeleteClick={() => openDeleteConfirm(doc)}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* ── Filename row ───────────────────────────────────────────── */}
            {displayName && displayName !== doc.title && (
              <p className="mt-2 truncate pl-1 text-[12px] leading-relaxed text-[#9A9A9A] dark:text-white/45">
                {displayName}
              </p>
            )}

            {/* ── Inline error ──────────────────────────────────────────── */}
            {errorMsg && (
              <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
                {errorMsg}
              </p>
            )}
          </>
        );

        const isClickable = Boolean(doc.file_url);
        const baseClassName = `${surfaceCardLight} p-5 transition-all duration-200 ease-out ${
          isDeleting ? "pointer-events-none opacity-35" : "opacity-100"
        }`;

        const interactiveClassName = isClickable
          ? `cursor-pointer ${surfaceCardLightHover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D0D0D0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F8F8] dark:focus-visible:ring-white/25 dark:focus-visible:ring-offset-neutral-950`
          : "";

        return (
          <motion.div
            key={doc.id}
            variants={cardVariants}
            className={menuOpenId === doc.id ? "relative z-[50]" : undefined}
          >
            {doc.file_url ? (
              <Link
                href={`/documents/${doc.id}`}
                className={`block ${baseClassName} ${interactiveClassName}`}
              >
                {cardContent}
              </Link>
            ) : (
              <div className={`${baseClassName} ${interactiveClassName}`}>
                {cardContent}
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>

    <AnimatePresence>
      {editingDoc && (
        <motion.div
          key="edit-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-doc-title-heading"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
            aria-label="Close"
            onClick={closeEdit}
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className={`relative w-full max-w-sm ${surfaceCardLight} p-6 shadow-xl`}
          >
            <h2 id="edit-doc-title-heading" className="text-[16px] font-bold text-[#111111] dark:text-white">
              Edit title
            </h2>
            <p className="mt-1 text-[12px] text-[#9A9A9A] dark:text-white/45">
              Only the display name changes—not the file.
            </p>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="mt-4 h-12 w-full rounded-[12px] border border-[#E5E5E5] bg-white px-4 text-[15px] text-[#111111] placeholder:text-[#BBBBBB] focus:border-[#D0D0D0] focus:outline-none dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/[0.18]"
              autoFocus
            />
            {editError && (
              <p className="mt-2 text-[12px] text-red-700 dark:text-red-300">{editError}</p>
            )}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={closeEdit}
                disabled={editPending}
                className="flex-1 rounded-[12px] border border-[#E5E5E5] bg-white py-3 text-[14px] font-medium text-[#444444] transition-colors hover:bg-[#FAFAFA] disabled:opacity-40 dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white/70 dark:hover:bg-white/[0.1]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveTitle()}
                disabled={editPending}
                className="flex-1 rounded-[12px] bg-[#111111] py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#222222] disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-white/90"
              >
                {editPending ? "Saving…" : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {deleteConfirmDoc && (
        <motion.div
          key="delete-doc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-doc-heading"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
            aria-label="Close"
            onClick={closeDeleteConfirm}
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className={`relative w-full max-w-sm ${surfaceCardLight} p-6 shadow-xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-doc-heading" className="text-[16px] font-bold text-[#111111] dark:text-white">
              Delete this document?
            </h2>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                disabled={isPending && deletingId === deleteConfirmDoc.id}
                className="flex-1 rounded-[12px] border border-[#E5E5E5] bg-white py-3 text-[14px] font-medium text-[#444444] transition-colors hover:bg-[#FAFAFA] disabled:opacity-40 dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white/70 dark:hover:bg-white/[0.1]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmDoc)}
                disabled={isPending && deletingId === deleteConfirmDoc.id}
                className="flex-1 rounded-[12px] border border-red-200 bg-red-50 py-3 text-[14px] font-semibold text-red-800 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/[0.12] dark:text-red-300 dark:hover:bg-red-500/[0.2]"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
