"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { DbDocument } from "@/lib/documents";
import { toggleAvailableOfflineAction } from "@/app/(app)/documents/actions";
import { useRouter } from "next/navigation";
import { getDocumentViewKind, getFileTypeDisplayLabel } from "@/lib/document-view-kind";
import { categoryLabel } from "@/components/documents/DocumentCategoryIcon";
import { PdfViewer } from "@/components/documents/PdfViewer";
import type { DocumentCategory } from "@/types/document";

type DocumentViewerProps = {
  doc: DbDocument;
};

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" />
      <path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path
        d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <div
      className="h-9 w-9 animate-spin rounded-full border-2 border-white/[0.12] border-t-white/50"
      role="status"
      aria-label="Loading"
    />
  );
}

function ContentSkeleton({ kind }: { kind: "pdf" | "image" }) {
  return (
    <div className="flex min-h-[48dvh] flex-col items-center justify-center gap-4 px-6 py-8">
      <Spinner />
      <p className="text-[13px] text-white/35">{kind === "pdf" ? "Opening PDF…" : "Loading image…"}</p>
      <div
        className={`w-full max-w-md rounded-2xl bg-white/[0.04] ${
          kind === "pdf" ? "h-[42dvh]" : "aspect-[3/4] max-h-[42dvh]"
        } animate-pulse`}
      />
    </div>
  );
}

function LoadingOverlay({ kind }: { kind: "pdf" | "image" }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0a0a]/92 backdrop-blur-sm">
      <Spinner />
      <p className="mt-4 text-[13px] text-white/40">{kind === "pdf" ? "Opening PDF…" : "Loading image…"}</p>
    </div>
  );
}

export function DocumentViewer({ doc }: DocumentViewerProps) {
  const router = useRouter();
  const [offlineTogglePending, setOfflineTogglePending] = useState(false);
  const [cachedBlob, setCachedBlob] = useState<Blob | null>(null);
  const [cachedLoading, setCachedLoading] = useState(doc.available_offline ?? false);
  const availableOffline = doc.available_offline ?? false;

  const viewKind = getDocumentViewKind(doc);
  const typeLabel = getFileTypeDisplayLabel(doc);
  const catLabel = categoryLabel(doc.category as DocumentCategory);

  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [loadKey, setLoadKey] = useState(0);
  const [imageZoomed, setImageZoomed] = useState(false);

  const displayUrl = cachedBlob ? URL.createObjectURL(cachedBlob) : doc.file_url;

  useEffect(() => {
    if (!displayUrl || !displayUrl.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(displayUrl);
  }, [displayUrl]);

  useEffect(() => {
    if (!availableOffline || !doc.file_url) {
      setCachedBlob(null);
      setCachedLoading(false);
      return;
    }

    let cancelled = false;
    setCachedLoading(true);

    async function loadFromCache() {
      try {
        if (typeof caches === "undefined") {
          if (!cancelled) setCachedLoading(false);
          return;
        }
        const cache = await caches.open(`ancular-doc-${doc.id}`);
        const cached = await cache.match(doc.file_url!);
        if (cancelled) return;
        if (cached) {
          const blob = await cached.blob();
          setCachedBlob(blob);
        } else {
          setCachedBlob(null);
        }
      } catch {
        if (!cancelled) setCachedBlob(null);
      } finally {
        if (!cancelled) setCachedLoading(false);
      }
    }

    loadFromCache();
    return () => {
      cancelled = true;
    };
  }, [doc.id, doc.file_url, availableOffline]);

  const resetLoadState = useCallback(() => {
    setMediaLoaded(false);
    setMediaError(false);
    setLoadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    resetLoadState();
    setImageZoomed(false);
  }, [doc.id, displayUrl, viewKind, resetLoadState]);

  async function handleToggleOffline() {
    const next = !availableOffline;
    setOfflineTogglePending(true);

    if (next && doc.file_url && typeof caches !== "undefined") {
      try {
        const res = await fetch(doc.file_url);
        if (!res.ok) {
          setOfflineTogglePending(false);
          return;
        }
        const cache = await caches.open(`ancular-doc-${doc.id}`);
        await cache.put(doc.file_url, res);
      } catch {
        setOfflineTogglePending(false);
        return;
      }
    } else if (!next && typeof caches !== "undefined") {
      try {
        const cache = await caches.open(`ancular-doc-${doc.id}`);
        if (doc.file_url) await cache.delete(doc.file_url);
      } catch {
        // Best effort
      }
    }

    const result = await toggleAvailableOfflineAction(doc.id, next);
    setOfflineTogglePending(false);
    if (!result.error) router.refresh();
  }

  const fileUrl = doc.file_url;
  const displayName = doc.file_name?.trim() || doc.title;

  const headerActions = fileUrl && (
    <div className="flex flex-shrink-0 items-center gap-0.5">
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white/85 active:bg-white/[0.08]"
        aria-label="Open externally"
      >
        <ExternalIcon />
      </a>
      <button
        type="button"
        onClick={handleToggleOffline}
        disabled={offlineTogglePending || !fileUrl}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/[0.06] active:bg-white/[0.08] disabled:opacity-40 ${
          availableOffline ? "text-emerald-400/90" : "text-white/50"
        }`}
        aria-label={availableOffline ? "Remove offline copy" : "Save for offline"}
        title={availableOffline ? "Available offline" : "Make available offline"}
      >
        <CloudIcon />
        {availableOffline && (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-neutral-950" />
        )}
      </button>
    </div>
  );

  const shell = (
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-[#0c0c0c] via-neutral-950 to-neutral-950">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-20 flex-shrink-0 border-b border-white/[0.07] bg-neutral-950/80 backdrop-blur-xl">
        <div
          className="relative flex min-h-[3.25rem] items-center justify-between px-2 pb-2"
          style={{ paddingTop: "max(0.5rem, var(--safe-area-top))" }}
        >
          <Link
            href="/documents"
            className="z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white active:bg-white/[0.08]"
            aria-label="Back to documents"
          >
            <BackIcon />
          </Link>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center justify-center px-14 text-center">
            <h1 className="line-clamp-2 max-w-full text-[15px] font-semibold leading-snug tracking-[-0.02em] text-white">
              {doc.title}
            </h1>
            <p className="mt-0.5 max-w-full truncate text-[10px] font-medium uppercase tracking-[0.1em] text-white/36">
              {catLabel}
              <span className="mx-1.5 text-white/18">·</span>
              {typeLabel}
            </p>
          </div>
          <div className="z-10 flex min-h-[44px] min-w-[88px] flex-shrink-0 items-center justify-end">
            {headerActions}
          </div>
        </div>
      </header>

      {/* Body */}
      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ paddingBottom: "max(1rem, var(--safe-area-bottom))" }}
      >
        {!fileUrl ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4">
              <p className="text-[15px] font-medium text-white/55">No file attached</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/32">
                Upload a file from a trip to see it here.
              </p>
            </div>
            <Link
              href="/documents"
              className="text-[14px] font-medium text-sky-400/90 hover:text-sky-300"
            >
              Back to documents
            </Link>
          </div>
        ) : viewKind === "unsupported" ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="max-w-[300px] rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-6">
              <p className="text-[15px] font-medium text-white/70">Preview unavailable</p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/38">
                This type can&apos;t be shown in the app. Open or download it instead.
              </p>
              <p className="mt-4 truncate text-[12px] text-white/25" title={displayName}>
                {displayName}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-[15px] font-semibold text-neutral-950 transition-opacity active:opacity-90"
              >
                Open externally
              </a>
              <a
                href={fileUrl}
                download={doc.file_name ?? undefined}
                className="inline-flex items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.05] px-6 py-3.5 text-[15px] font-medium text-white/80 transition-colors hover:bg-white/[0.08]"
              >
                Download
              </a>
            </div>
          </div>
        ) : mediaError ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
            <p className="text-[15px] text-white/50">Couldn&apos;t load this file</p>
            <p className="max-w-[280px] text-[13px] leading-relaxed text-white/32">
              Check your connection or try opening it outside the app.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={resetLoadState}
                className="rounded-2xl bg-white px-6 py-3.5 text-[15px] font-semibold text-neutral-950 active:opacity-90"
              >
                Retry
              </button>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/[0.12] px-6 py-3.5 text-[15px] font-medium text-white/75 hover:bg-white/[0.06]"
              >
                Open externally
              </a>
            </div>
          </div>
        ) : cachedLoading && availableOffline ? (
          <ContentSkeleton kind={viewKind} />
        ) : viewKind === "pdf" ? (
          <div className="flex h-full min-h-0 flex-1 flex-col px-3 pt-3">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
              <PdfViewer
                fileSrc={displayUrl ?? ""}
                loadKey={loadKey}
                onReady={() => {
                  setMediaLoaded(true);
                  setMediaError(false);
                }}
                onError={() => {
                  setMediaError(true);
                  setMediaLoaded(false);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            <div
              className={`relative flex min-h-0 flex-1 flex-col overflow-hidden px-3 pt-3 ${
                imageZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
            >
              {!mediaLoaded && !mediaError && <LoadingOverlay kind="image" />}
              <div
                className="flex min-h-0 flex-1 overflow-auto overscroll-contain rounded-2xl bg-black/20"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- blob / signed URLs */}
                <img
                  key={loadKey}
                  src={displayUrl ?? ""}
                  alt={doc.title}
                  onLoad={() => {
                    setMediaLoaded(true);
                    setMediaError(false);
                  }}
                  onError={() => {
                    setMediaError(true);
                    setMediaLoaded(false);
                  }}
                  onClick={() => setImageZoomed((z) => !z)}
                  className={`mx-auto my-auto block max-h-[min(78dvh,100%)] max-w-full origin-center transition-transform duration-300 ease-out will-change-transform ${
                    imageZoomed ? "scale-[2.25] max-h-none py-6" : "scale-100 object-contain"
                  }`}
                />
              </div>
            </div>
            {mediaLoaded && (
              <p className="flex-shrink-0 pb-1 pt-2 text-center text-[11px] text-white/30">
                Tap image to {imageZoomed ? "fit screen" : "zoom in"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed inset-0 z-[100] flex flex-col text-white"
    >
      {shell}
    </motion.main>
  );
}
