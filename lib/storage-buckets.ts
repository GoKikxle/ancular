import type { DocumentCategory } from "@/types/document";

/**
 * Maps each document category to its Supabase Storage bucket name.
 *
 * All buckets are private — see supabase/storage-setup.sql for the full
 * bucket definitions and RLS policies.
 *
 * Category → Bucket → Typical document examples
 * ──────────────────────────────────────────────
 * identity → identity  passport, ID card, visa
 * flight   → flight    boarding pass, e-ticket, flight itinerary
 * hotel    → hotel     hotel confirmation, reservation voucher
 * booking  → booking   restaurant/activity/tour booking, conference pass
 * other    → other     miscellaneous travel documents
 */
export const STORAGE_BUCKETS: Record<DocumentCategory, string> = {
  identity: "identity",
  flight:   "flight",
  hotel:    "hotel",
  booking:  "booking",
  other:    "other",
} as const;

/** Returns the storage bucket name for a given document category. */
export function getBucketForCategory(category: DocumentCategory): string {
  return STORAGE_BUCKETS[category];
}

/**
 * Signed URL TTL used when storing file_url in the documents table.
 * 5 years in seconds — long enough to be practically permanent.
 * Regenerate by calling createSignedUrl(storage_bucket, storage_path, SIGNED_URL_TTL).
 */
export const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 5; // 157 680 000 s ≈ 5 years
