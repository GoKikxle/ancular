import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import { previewEnabled } from "@/lib/preview-events";

/**
 * Local preview visitor on an invite. Not PREVIEW_OWNER_ID, so this person
 * is never treated as the host of the event.
 */
export const PREVIEW_GUEST_ID = "00000000-0000-4000-8000-000000000002";

export const PREVIEW_GUEST_COOKIE = "ancular-preview-guest";

const FILE = path.join(process.cwd(), "data", "preview-guests.json");

export type PreviewGuestMembership = {
  event_id: string;
  user_id: typeof PREVIEW_GUEST_ID;
  role: "guest";
  status: "pending" | "approved" | "declined";
  display_name: string | null;
  /** Face-matching consent. Starts false; the selfie is never stored here. */
  consent: boolean;
};

/** Only an invite path is safe to follow from "Continue without an account". */
export function safeInvitePath(next: string | null | undefined): string | null {
  if (!next) return null;
  const value = next.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("://")) {
    return null;
  }
  let pathname = value.split("?")[0]?.split("#")[0] ?? "";
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
  const match = pathname.match(/^\/e\/([A-Za-z0-9]{1,64})$/);
  if (!match) return null;
  return `/e/${match[1]}`;
}

export function continueWithoutAccountHref(next: string | null | undefined) {
  const invite = safeInvitePath(next);
  if (!invite || !previewEnabled()) return "/dashboard";
  return `/preview/continue?next=${encodeURIComponent(invite)}`;
}

export function previewGuestCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };
}

export async function previewGuestActive() {
  if (!previewEnabled()) return false;
  const jar = await cookies();
  return jar.get(PREVIEW_GUEST_COOKIE)?.value === PREVIEW_GUEST_ID;
}

async function readMemberships(): Promise<PreviewGuestMembership[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as { memberships?: PreviewGuestMembership[] };
    const rows = Array.isArray(parsed.memberships) ? parsed.memberships : [];
    return rows.filter((row) => row.user_id === PREVIEW_GUEST_ID && row.role === "guest");
  } catch {
    return [];
  }
}

async function writeMemberships(memberships: PreviewGuestMembership[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify({ memberships }, null, 2));
}

export async function getPreviewMembership(eventId: string) {
  const memberships = await readMemberships();
  return memberships.find((row) => row.event_id === eventId) ?? null;
}

/**
 * Local preview has no separate host session that can approve this visitor.
 * They join as a guest (never the owner) and still have to tick consent
 * before the selfie step. The selfie itself is not written here.
 */
export async function joinPreviewGuest(eventId: string, displayName: string) {
  const memberships = await readMemberships();
  const index = memberships.findIndex((row) => row.event_id === eventId);
  if (index === -1) {
    memberships.push({
      event_id: eventId,
      user_id: PREVIEW_GUEST_ID,
      role: "guest",
      status: "approved",
      display_name: displayName || null,
      consent: false,
    });
  } else {
    const current = memberships[index];
    memberships[index] = {
      ...current,
      user_id: PREVIEW_GUEST_ID,
      role: "guest",
      display_name: displayName || current.display_name,
    };
  }
  await writeMemberships(memberships);
}

export async function setPreviewGuestConsent(eventId: string, consent: boolean) {
  const memberships = await readMemberships();
  const index = memberships.findIndex((row) => row.event_id === eventId);
  if (index === -1) return false;
  const current = memberships[index];
  if (current.status !== "approved" || current.role !== "guest") return false;
  memberships[index] = { ...current, consent };
  await writeMemberships(memberships);
  return true;
}
