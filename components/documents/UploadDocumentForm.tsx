"use client";

import { useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DocumentCategory } from "@/types/document";
import type { TripDateContext } from "@/lib/document-to-timeline";
import { uploadAndAttachDocumentAction } from "@/app/trips/[tripId]/actions";

type Props = {
  tripId: string;
  tripSlug: string;
  /** Forwarded to the upload action so generated timeline items get real dates. */
  tripDates?: TripDateContext;
};

type UploadState =
  | "idle"
  | { success: true; linkedToTimeline: boolean; linkedItemTitle: string | null }
  | { error: string };

const CATEGORIES: [DocumentCategory, string][] = [
  ["flight", "Flight"],
  ["hotel", "Hotel"],
  ["identity", "Identity"],
  ["booking", "Booking"],
  ["other", "Other"],
];

const slideVariants = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/** Strips the file extension and replaces separators with spaces. */
function fileBaseName(filename: string): string {
  return filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

export function UploadDocumentForm({ tripId, tripSlug, tripDates }: Props) {
  const [open, setOpen] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [nameValue, setNameValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file && !nameValue) {
      setNameValue(fileBaseName(file.name));
    }
    setUploadState("idle");
  }

  function handleToggle() {
    setOpen((o) => !o);
    if (open) resetForm();
  }

  function resetForm() {
    formRef.current?.reset();
    setSelectedFile(null);
    setNameValue("");
    setUploadState("idle");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setUploadState("idle");

    startTransition(async () => {
      const result = await uploadAndAttachDocumentAction(tripId, tripSlug, formData);
      if (result.error) {
        setUploadState({ error: result.error });
      } else {
        setUploadState({
          success: true,
          linkedToTimeline: result.linkedToTimeline,
          linkedItemTitle: result.linkedItemTitle,
        });
        setTimeout(() => {
          setOpen(false);
          resetForm();
        }, 1800);
      }
    });
  }

  const isSuccess = typeof uploadState === "object" && "success" in uploadState;
  const errorMessage = typeof uploadState === "object" && "error" in uploadState ? uploadState.error : null;

  function uploadSuccessMessage(): string {
    if (!isSuccess) return "";
    const { linkedToTimeline: linked, linkedItemTitle: title } =
      uploadState as { success: true; linkedToTimeline: boolean; linkedItemTitle: string | null };
    if (linked && title) return `Uploaded and linked to ${title}.`;
    if (linked)          return "Uploaded · linked to timeline action.";
    return "Uploaded successfully. No matching action found yet.";
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`rounded-full border px-3 py-1 text-[11px] transition-colors disabled:opacity-40 ${
          open
            ? "border-white/[0.18] bg-white/[0.09] text-white/80"
            : "border-white/[0.07] text-white/35 hover:text-white/55"
        }`}
      >
        {open ? "Cancel" : "↑ Upload new"}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="upload-form"
            variants={slideVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="overflow-hidden"
          >
            {isSuccess ? (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  className="flex-shrink-0 text-emerald-400"
                >
                  <path
                    d="M2.5 7L5.5 10L11.5 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-[13px] text-emerald-300">{uploadSuccessMessage()}</p>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="mt-4 space-y-3"
              >
                {/* File picker */}
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/30">
                    File
                  </label>
                  <label
                    htmlFor="upload-file"
                    className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-[13px] transition-colors hover:border-white/[0.14] hover:bg-white/[0.06]"
                  >
                    <svg
                      width="13"
                      height="14"
                      viewBox="0 0 13 14"
                      fill="none"
                      aria-hidden="true"
                      className="flex-shrink-0 text-white/30"
                    >
                      <rect x="1.5" y="1" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M4 5h5M4 7.5h5M4 10h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                    </svg>
                    <span className={`truncate ${selectedFile ? "text-white/70" : "text-white/25"}`}>
                      {selectedFile ? selectedFile.name : "Choose PDF or image…"}
                    </span>
                  </label>
                  <input
                    id="upload-file"
                    type="file"
                    name="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </div>

                {/* Title */}
                <div>
                  <label
                    htmlFor="upload-name"
                    className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/30"
                  >
                    Title
                  </label>
                  <input
                    id="upload-name"
                    name="name"
                    type="text"
                    required
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    placeholder="e.g. Boarding pass"
                    className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-white placeholder-white/20 transition-colors focus:border-white/[0.15] focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="upload-category"
                    className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/30"
                  >
                    Category
                  </label>
                  <select
                    id="upload-category"
                    name="category"
                    defaultValue="other"
                    className="w-full rounded-2xl border border-white/[0.08] bg-[#0a0a0a] px-3.5 py-2.5 text-[13px] text-white transition-colors focus:border-white/[0.15] focus:outline-none"
                  >
                    {CATEGORIES.map(([val, label]) => (
                      <option key={val} value={val} className="bg-neutral-900">
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Inline error */}
                {errorMessage && (
                  <p className="rounded-2xl border border-red-500/20 bg-red-500/[0.07] px-3.5 py-2.5 text-[12px] text-red-300">
                    {errorMessage}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleToggle}
                    disabled={isPending}
                    className="flex-1 rounded-2xl border border-white/[0.07] py-2.5 text-[13px] text-white/40 transition-colors hover:text-white/60 disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    disabled={isPending || !selectedFile}
                    className="flex-1 rounded-2xl bg-white/[0.08] py-2.5 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/[0.12] disabled:opacity-35"
                  >
                    {isPending ? "Uploading…" : "Upload"}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
