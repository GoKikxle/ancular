/**
 * Preset avatar options — single source of truth.
 * Avatar files live in /public/avatars/
 *
 * To add new avatars:
 * 1. Add avatar_N.png (or .svg) to /public/avatars/
 * 2. Add entry to AVATAR_OPTIONS below
 */

export const AVATAR_OPTIONS = [
  { id: "avatar_1", src: "/avatars/avatar_1.svg", alt: "Avatar 1" },
  { id: "avatar_2", src: "/avatars/avatar_2.svg", alt: "Avatar 2" },
  { id: "avatar_3", src: "/avatars/avatar_3.svg", alt: "Avatar 3" },
  { id: "avatar_4", src: "/avatars/avatar_4.svg", alt: "Avatar 4" },
  { id: "avatar_5", src: "/avatars/avatar_5.svg", alt: "Avatar 5" },
  { id: "avatar_6", src: "/avatars/avatar_6.svg", alt: "Avatar 6" },
  { id: "avatar_7", src: "/avatars/avatar_7.svg", alt: "Avatar 7" },
  { id: "avatar_8", src: "/avatars/avatar_8.svg", alt: "Avatar 8" },
  { id: "avatar_9", src: "/avatars/avatar_9.svg", alt: "Avatar 9" },
  { id: "avatar_10", src: "/avatars/avatar_10.svg", alt: "Avatar 10" },
  { id: "avatar_11", src: "/avatars/avatar_11.svg", alt: "Avatar 11" },
  { id: "avatar_12", src: "/avatars/avatar_12.svg", alt: "Avatar 12" },
  { id: "avatar_13", src: "/avatars/avatar_13.svg", alt: "Avatar 13" },
  { id: "avatar_14", src: "/avatars/avatar_14.svg", alt: "Avatar 14" },
  { id: "avatar_15", src: "/avatars/avatar_15.svg", alt: "Avatar 15" },
  { id: "avatar_16", src: "/avatars/avatar_16.svg", alt: "Avatar 16" },
] as const;

export const DEFAULT_AVATAR_ID = "avatar_1";

export type AvatarId = (typeof AVATAR_OPTIONS)[number]["id"];

/** Resolve avatar src by id. Falls back to default avatar if not found. */
export function getAvatarById(avatarId: string | null): {
  id: string;
  src: string;
  alt: string;
} {
  const found = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  if (found) return found;
  const defaultOption = AVATAR_OPTIONS.find((a) => a.id === DEFAULT_AVATAR_ID);
  return defaultOption ?? AVATAR_OPTIONS[0];
}
