"use client";

import { useState, useCallback, useEffect } from "react";
import type { DbDocument } from "@/lib/documents";
import { toggleAvailableOfflineAction } from "@/app/(app)/documents/actions";
import { useRouter } from "next/navigation";

const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const PDF_TYPE = "application/pdf";

function isViewableInApp(mimeType: string | null | undefined): boolean {
  if (!mimeType) return false;
  return mimeType === PDF_TYPE || SUPPORTED_IMAGE_TYPES.includes(mimeType);
}

type DocumentViewerProps = {
  doc: DbDocument;
};

export function DocumentViewer({ doc }: DocumentViewerProps) {
  const router = useRouter();
  const [offlineTogglePending, setOfflineTogglePending] = useState(false);
  const [cachedBlob, setCachedBlob] = useState<Blob | null>(null);
  const [cachedLoading, setCachedLoading] = useState(doc.available_offline ?? false);
  const availableOffline = doc.available_offline ?? false;

  // Try to load from cache when doc is marked available offline
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
        // Best effort; still update DB
      }
    }

    const result = await toggleAvailableOfflineAction(doc.id, next);
    setOfflineTogglePending(false);
    if (!result.error) router.refresh();
  }

  const displayUrl = cachedBlob ? URL.createObjectURL(cachedBlob) : doc.file_url;

  useEffect(() => {
    if (!displayUrl || !displayUrl.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(displayUrl);
  }, [displayUrl]);

  const isViewable = isViewableInApp(doc.mime_type);

  if (!doc.file_url) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
        <p className="text-[15px] text-white/50">No file attached to this document</p>
      </div>
    );
  }

  if (!isViewable) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
        <p className="text-[15px] text-white/50">Preview not available for this file type</p>
        <a
          href={doc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/[0.15] bg-white/[0.06] px-4 py-2 text-[14px] font-medium text-white/80 transition-colors hover:bg-white/[0.1]"
        >
          Open externally
        </a>
      </div>
    );
  }

  const isPdf = doc.mime_type === PDF_TYPE;

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar: offline toggle + open externally */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2">
        <button
          type="button"
          onClick={handleToggleOffline}
          disabled={offlineTogglePending}
          className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[12px] text-white/70 transition-colors hover:bg-white/[0.08] disabled:opacity-50"
        >
          {offlineTogglePending ? (
            "…"
          ) : availableOffline ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Available offline
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full border border-white/30" />
              Make available offline
            </>
          )}
        </button>
        <a
          href={doc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-white/50 transition-colors hover:text-white/70"
        >
          Open externally
        </a>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {cachedLoading && availableOffline ? (
          <div className="flex h-48 items-center justify-center text-[14px] text-white/40">
            Loading from cache…
          </div>
        ) : isPdf ? (
          <iframe
            src={displayUrl ?? ""}
            title={doc.title}
            className="h-full min-h-[60vh] w-full rounded-lg border border-white/[0.08] bg-white"
          />
        ) : (
          <img
            src={displayUrl ?? ""}
            alt={doc.title}
            className="mx-auto max-w-full rounded-lg object-contain"
          />
        )}
      </div>
    </div>
  );
}
