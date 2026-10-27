export type EventKind = "wedding" | "church" | "party" | "birthday" | "corporate" | "other";
export type JoinMode = "open" | "approval";

export type EventRow = {
  id: string;
  owner_id: string;
  name: string;
  host_name: string | null;
  kind: EventKind;
  event_date: string | null;
  venue: string | null;
  invite_code: string;
  join_mode: JoinMode;
  face_retention_days: number;
  status: "active" | "archived";
  created_at: string;
  /** Face model for this event's face codes. Missing on rows from before it existed: treat as "v1". */
  face_model?: "v1" | "v2";
};

export type MemberRow = {
  event_id: string;
  user_id: string;
  role: "host" | "guest";
  status: "pending" | "approved" | "declined";
  display_name: string | null;
  requested_at: string;
};

export type PhotoRow = {
  id: string;
  event_id: string;
  original_name: string | null;
  width: number | null;
  height: number | null;
  face_count: number;
  status: "uploading" | "ready" | "failed";
  created_at: string;
};

export const KIND_LABELS: Record<EventKind, string> = {
  wedding: "Wedding",
  church: "Church programme",
  party: "Party",
  birthday: "Birthday",
  corporate: "Company event",
  other: "Other event",
};

export const CONSENT_VERSION = "2026-10-v1";

export function formatEventDate(date: string | null) {
  if (!date) return null;
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export function inviteUrl(code: string) {
  return `${siteUrl()}/e/${code}`;
}
