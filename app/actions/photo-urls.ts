"use server";

import { getUser } from "@/lib/supabase/server";
import { photoKey, signDownloads } from "@/lib/storage";

export type PhotoUrls = Record<string, { thumb?: string; preview?: string }>;

/**
 * Direct storage links for photos the signed-in person may see, in one go.
 * Row level security decides which photos come back (hosts: their events;
 * guests: only photos matched to them), so asking for others returns nothing.
 * Links last an hour. Anything not returned falls back to /api/photos/….
 */
export async function getPhotoUrls(photoIds: string[]): Promise<PhotoUrls> {
  const ids = [...new Set(photoIds)].filter((id) => /^[0-9a-f-]{36}$/i.test(id)).slice(0, 600);
  if (ids.length === 0) return {};
  const { supabase, user } = await getUser();
  if (!user) return {};
  const { data } = await supabase.from("photos").select("id, event_id").in("id", ids);
  const rows = (data ?? []) as { id: string; event_id: string }[];
  if (rows.length === 0) return {};

  const keys = rows.flatMap((r) => [photoKey(r.event_id, r.id, "thumb"), photoKey(r.event_id, r.id, "preview")]);
  const signed = await signDownloads(keys, 60 * 60);
  const out: PhotoUrls = {};
  for (const r of rows) {
    out[r.id] = {
      thumb: signed[photoKey(r.event_id, r.id, "thumb")],
      preview: signed[photoKey(r.event_id, r.id, "preview")],
    };
  }
  return out;
}
