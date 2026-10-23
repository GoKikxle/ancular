import { HOST_DECLINED_MESSAGE, HOST_PENDING_MESSAGE } from "@/lib/host-access";
import { BYTE_CAP_MESSAGE, FILE_TOO_BIG_MESSAGE, PHOTO_CAP_MESSAGE } from "@/lib/limits";

/** Sentences we already show. Leave these wording-for-wording. */
const KEPT = new Set<string>([
  PHOTO_CAP_MESSAGE,
  BYTE_CAP_MESSAGE,
  FILE_TOO_BIG_MESSAGE,
  "This photo is larger than the space left in your 10 GB.",
  "This photo has no size. Try it again.",
  HOST_PENDING_MESSAGE,
  HOST_DECLINED_MESSAGE,
  "Only hosts can add photos to this event.",
  "The upload failed. Try again.",
  "This file type can't be read. Export it as JPEG and try again.",
  "Face finder didn't load. Check your connection.",
  "Sign in again to upload.",
  "Sign in again to create an event.",
  "Sign in again to save this event.",
  "Sign in again to view photos.",
  "You can't create an event until your account is approved.",
]);

/**
 * Turn a database or auth error into a sentence a tester can read.
 * Unknown text, policy names, and stack traces become the fallback.
 */
export function plainError(message: string | null | undefined, fallback: string): string {
  const raw = (message ?? "").replace(/\s+/g, " ").trim();
  if (!raw) return fallback;
  if (KEPT.has(raw)) return raw;

  const key = raw.replace(/[.!]+$/g, "").toLowerCase();

  if (/^upload failed(\s*\(\d+\))?$/.test(key)) return "The upload failed. Try again.";
  if (key.includes("invalid login")) {
    return "That email and password don't match. Try again or use a sign-in link.";
  }
  if (key.includes("already registered") || key.includes("already been registered")) {
    return "There's already an account with this email. Sign in instead.";
  }
  if (key.includes("email not confirmed")) return "Confirm your email, then sign in.";
  if (
    key.includes("rate limit") ||
    key.includes("too many") ||
    key.includes("only request this after") ||
    key.includes("security purposes")
  ) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (
    key.includes("password") &&
    (key.includes("at least") || key.includes("short") || key.includes("weak") || key.includes("characters"))
  ) {
    return "Use a password of at least 6 characters.";
  }
  if (key.includes("unable to validate email") || key.includes("invalid format") || key.includes("invalid email")) {
    return "That email address doesn't look right.";
  }
  if (key.includes("invite link is not valid") || key.includes("invite link isn't working")) {
    return "This invite link isn't working.";
  }
  if (key.includes("not part of this event")) return "You're not part of this event yet.";
  if (key.includes("face matching before")) return "Agree to face matching before you search.";
  if (key.includes("sign in to search")) return "Sign in again to search.";
  if (key.includes("sign in to join")) return "Sign in to join this event.";
  if (key.includes("event is closed")) return "This event is closed.";
  if (key === "sign in first") return "Sign in first.";
  if (key === "sign in again" || key.includes("jwt") || key.includes("not authenticated")) return "Sign in again.";

  return fallback;
}
