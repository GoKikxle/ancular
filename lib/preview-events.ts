import { randomBytes, randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { EventKind, EventRow, JoinMode } from "@/lib/events";

/** Stable owner for events created in local preview, when Supabase sign-in isn't available. */
export const PREVIEW_OWNER_ID = "00000000-0000-4000-8000-000000000001";

const FILE = path.join(process.cwd(), "data", "preview-events.json");

export type PreviewEventInput = {
  name: string;
  hostName: string;
  kind: EventKind;
  eventDate: string | null;
  venue: string | null;
  joinMode: JoinMode;
  retention: number;
};

export function previewEnabled() {
  return process.env.NODE_ENV === "development";
}

async function readEvents(): Promise<EventRow[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as { events?: EventRow[] };
    return Array.isArray(parsed.events) ? parsed.events : [];
  } catch {
    return [];
  }
}

async function writeEvents(events: EventRow[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify({ events }, null, 2));
}

function inviteCode() {
  return randomBytes(6).toString("hex").slice(0, 10).toUpperCase();
}

export async function listPreviewEvents() {
  const events = await readEvents();
  return events.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getPreviewEvent(id: string) {
  const events = await readEvents();
  return events.find((event) => event.id === id) ?? null;
}

export async function getPreviewEventByInviteCode(code: string) {
  const needle = code.trim().toUpperCase();
  if (!needle) return null;
  const events = await readEvents();
  return events.find((event) => event.invite_code.toUpperCase() === needle) ?? null;
}

export async function createPreviewEvent(input: PreviewEventInput): Promise<EventRow> {
  const events = await readEvents();
  const event: EventRow = {
    id: randomUUID(),
    owner_id: PREVIEW_OWNER_ID,
    name: input.name,
    host_name: input.hostName || null,
    kind: input.kind,
    event_date: input.eventDate,
    venue: input.venue,
    invite_code: inviteCode(),
    join_mode: input.joinMode,
    face_retention_days: input.retention,
    status: "active",
    created_at: new Date().toISOString(),
  };
  events.unshift(event);
  await writeEvents(events);
  return event;
}

export async function updatePreviewEvent(id: string, input: PreviewEventInput) {
  const events = await readEvents();
  const index = events.findIndex((event) => event.id === id);
  if (index === -1) return null;
  events[index] = {
    ...events[index],
    name: input.name,
    host_name: input.hostName || null,
    kind: input.kind,
    event_date: input.eventDate,
    venue: input.venue,
    join_mode: input.joinMode,
    face_retention_days: input.retention,
  };
  await writeEvents(events);
  return events[index];
}

export async function deletePreviewEvent(id: string) {
  const events = await readEvents();
  const next = events.filter((event) => event.id !== id);
  if (next.length === events.length) return false;
  await writeEvents(next);
  return true;
}
