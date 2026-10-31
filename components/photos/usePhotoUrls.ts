"use client";

import { useEffect, useState } from "react";
import { getPhotoUrls, type PhotoUrls } from "@/app/actions/photo-urls";

// Links are signed for an hour; reuse them across components for 50 minutes.
const cache = new Map<string, { urls: PhotoUrls[string]; at: number }>();
const FRESH_MS = 50 * 60 * 1000;

/**
 * Direct links for a set of photos, fetched in one request.
 * `ready` turns true once the links are known (or the request failed), so images
 * can wait for the fast link instead of starting a slow one.
 */
export function usePhotoUrls(ids: string[]) {
  const key = ids.join(",");
  const [, setTick] = useState(0);

  useEffect(() => {
    const now = Date.now();
    const missing = ids.filter((id) => {
      const hit = cache.get(id);
      return !hit || now - hit.at > FRESH_MS;
    });
    if (missing.length === 0) return;
    let cancelled = false;
    getPhotoUrls(missing)
      .catch(() => ({}) as PhotoUrls)
      .then((urls) => {
        const at = Date.now();
        // Remember misses too, so they fall back to the slower route instead of waiting.
        for (const id of missing) cache.set(id, { urls: urls[id] ?? {}, at });
        if (!cancelled) setTick((t) => t + 1);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  function url(id: string, variant: "thumb" | "preview") {
    return cache.get(id)?.urls[variant] ?? `/api/photos/${id}/${variant}`;
  }
  const ready = ids.every((id) => cache.has(id));
  /** The link once known; null while it is still being fetched. */
  function src(id: string, variant: "thumb" | "preview") {
    return cache.has(id) ? url(id, variant) : null;
  }
  return { url, src, ready };
}
