"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Document, DocumentCategory } from "@/types/document";
import { DocumentCategoryIcon } from "./DocumentCategoryIcon";

type TripDocumentsPanelProps = {
  attachedDocs: Document[];
  availableDocs: Document[];
  onAttach: (documentId: string) => Promise<void>;
  onDetach: (documentId: string) => Promise<void>;
  onUpload: (formData: FormData) => Promise<void>;
};

type ActivePanel = "attach" | "upload" | null;

const panelVariants = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

export function TripDocumentsPanel({
  attachedDocs,
  availableDocs,
  onAttach,
  onDetach,
  onUpload,
}: TripDocumentsPanelProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [attachPending, startAttach] = useTransition();
  const [detachPending, startDetach] = useTransition();
  const [uploadPending, startUpload] = useTransition();

  function togglePanel(panel: ActivePanel) {
    setActivePanel((prev) => (prev === panel ? null : panel));
  }

  function handleAttach(documentId: string) {
    startAttach(async () => {
      await onAttach(documentId);
      setActivePanel(null);
    });
  }

  function handleDetach(documentId: string) {
    startDetach(() => onDetach(documentId));
  }

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startUpload(async () => {
      await onUpload(formData);
      setActivePanel(null);
    });
  }

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.1em] text-white/35">
          Documents
        </p>
        <div className="flex gap-1.5">
          <button
            onClick={() => togglePanel("attach")}
            className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
              activePanel === "attach"
                ? "border-white/[0.18] bg-white/[0.09] text-white/80"
                : "border-white/[0.07] text-white/35 hover:text-white/55"
            }`}
          >
            Attach
          </button>
          <button
            onClick={() => togglePanel("upload")}
            className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
              activePanel === "upload"
                ? "border-white/[0.18] bg-white/[0.09] text-white/80"
                : "border-white/[0.07] text-white/35 hover:text-white/55"
            }`}
          >
            Upload
          </button>
        </div>
      </div>

      {/* Attached documents */}
      {attachedDocs.length > 0 ? (
        <ul className="space-y-2.5">
          {attachedDocs.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5 text-[14px] text-white/60">
                <DocumentCategoryIcon category={doc.category} />
                <span className="truncate">{doc.name}</span>
              </div>
              <button
                onClick={() => handleDetach(doc.id)}
                disabled={detachPending}
                aria-label={`Detach ${doc.name}`}
                className="flex-shrink-0 rounded-full p-1.5 text-white/20 transition-colors hover:text-white/50 disabled:opacity-30"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path
                    d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-white/28">No documents attached yet.</p>
      )}

      {/* Expandable: Attach from vault */}
      <AnimatePresence initial={false}>
        {activePanel === "attach" && (
          <motion.div
            key="attach-panel"
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-white/[0.06] pt-4">
              <p className="mb-2.5 text-[11px] uppercase tracking-[0.1em] text-white/30">
                From Vault
              </p>
              {availableDocs.length > 0 ? (
                <ul className="space-y-0.5">
                  {availableDocs.map((doc) => (
                    <li key={doc.id}>
                      <motion.button
                        onClick={() => handleAttach(doc.id)}
                        disabled={attachPending}
                        whileTap={{ scale: 0.98 }}
                        className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[13px] text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white/75 disabled:opacity-40"
                      >
                        <DocumentCategoryIcon category={doc.category} />
                        {doc.name}
                      </motion.button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-white/28">
                  All vault documents are already attached.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Expandable: Upload new */}
        {activePanel === "upload" && (
          <motion.div
            key="upload-panel"
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="overflow-hidden"
          >
            <form
              onSubmit={handleUpload}
              className="mt-4 space-y-3 border-t border-white/[0.06] pt-4"
            >
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/30">
                  Name
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Hotel receipt"
                  className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-white placeholder-white/20 focus:border-white/[0.15] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/30">
                  Category
                </label>
                <select
                  name="category"
                  defaultValue="other"
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0a0a0a] px-3.5 py-2.5 text-[13px] text-white focus:border-white/[0.15] focus:outline-none transition-colors"
                >
                  {(
                    [
                      ["flight", "Flight"],
                      ["hotel", "Hotel"],
                      ["identity", "Identity"],
                      ["booking", "Booking"],
                      ["other", "Other"],
                    ] as [DocumentCategory, string][]
                  ).map(([val, label]) => (
                    <option key={val} value={val} className="bg-neutral-900">
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActivePanel(null)}
                  className="flex-1 rounded-2xl border border-white/[0.07] py-2.5 text-[13px] text-white/40 transition-colors hover:text-white/60"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  disabled={uploadPending}
                  className="flex-1 rounded-2xl bg-white/[0.08] py-2.5 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/[0.12] disabled:opacity-40"
                >
                  {uploadPending ? "Uploading…" : "Upload"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
