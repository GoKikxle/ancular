/** Beta storage cap. Keep these in step with supabase/migrations/0003_waitlist_and_limits.sql. */
export const HOST_PHOTO_CAP = 2000;
export const HOST_BYTE_CAP = 10 * 1024 * 1024 * 1024;
export const PHOTO_FILE_MAX_BYTES = 40 * 1024 * 1024;

export const PHOTO_CAP_MESSAGE = "You've reached the limit of 2,000 photos for this beta.";
export const BYTE_CAP_MESSAGE = "You've reached the 10 GB limit for this beta.";
export const FILE_TOO_BIG_MESSAGE = "Photos must be under 40 MB.";

export type StorageUsage = {
  photos: number;
  bytes: number;
};

export type CapCode = "photo_cap" | "byte_cap" | "byte_cap_file";

export function photoFileError(bytes: number): string | null {
  if (!Number.isFinite(bytes) || bytes < 1) return "This photo has no size. Try it again.";
  if (bytes > PHOTO_FILE_MAX_BYTES) return FILE_TOO_BIG_MESSAGE;
  return null;
}

/** Plain error when this upload would pass the host cap. Null when it fits. */
export function capBlock(usage: StorageUsage, incomingBytes = 0): { code: CapCode; error: string } | null {
  if (usage.photos >= HOST_PHOTO_CAP) return { code: "photo_cap", error: PHOTO_CAP_MESSAGE };
  if (usage.bytes >= HOST_BYTE_CAP) return { code: "byte_cap", error: BYTE_CAP_MESSAGE };
  if (usage.bytes + incomingBytes > HOST_BYTE_CAP) {
    return { code: "byte_cap_file", error: "This photo is larger than the space left in your 10 GB." };
  }
  return null;
}

export function formatBytes(bytes: number) {
  const safe = Math.max(0, bytes);
  if (safe <= 0) return "0 GB";
  const gb = safe / HOST_BYTE_CAP * 10;
  if (gb >= 1) {
    const rounded = gb >= 10 ? Math.round(gb) : Math.round(gb * 10) / 10;
    return `${rounded} GB`;
  }
  const mb = safe / (1024 * 1024);
  if (mb >= 1) return `${Math.round(mb)} MB`;
  return "under 1 MB";
}

export function formatAllowance(usage: StorageUsage) {
  const photos = Math.max(0, HOST_PHOTO_CAP - usage.photos);
  const photoLabel = `${photos.toLocaleString("en-GB")} ${photos === 1 ? "photo" : "photos"} left`;
  return `${photoLabel} · ${formatBytes(Math.max(0, HOST_BYTE_CAP - usage.bytes))} left`;
}
