/**
 * Avatar IDs and helpers — safe for client and server.
 * No Supabase imports.
 */

export const AVATAR_IDS = [
  "avatar_1",
  "avatar_2",
  "avatar_3",
  "avatar_4",
  "avatar_5",
  "avatar_6",
  "avatar_7",
  "avatar_8",
  "avatar_9",
  "avatar_10",
  "avatar_11",
  "avatar_12",
  "avatar_13",
  "avatar_14",
  "avatar_15",
  "avatar_16",
] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];

export function getAvatarUrl(avatarId: string): string {
  return `/avatars/${avatarId}.svg`;
}
