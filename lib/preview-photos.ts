import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { PhotoRow } from "@/lib/events";
import { VARIANTS, type Variant } from "@/lib/storage";

const FILE = path.join(process.cwd(), "data", "preview-photos.json");
const FILES = path.join(process.cwd(), "data", "preview-files");

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let writeChain: Promise<unknown> = Promise.resolve();

function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readPhotos(): Promise<PhotoRow[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as { photos?: PhotoRow[] };
    return Array.isArray(parsed.photos) ? parsed.photos : [];
  } catch {
    return [];
  }
}

async function writePhotos(photos: PhotoRow[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify({ photos }, null, 2));
}

export function isPreviewId(id: string) {
  return UUID.test(id);
}

export function previewFilePath(eventId: string, photoId: string, variant: Variant) {
  if (!isPreviewId(eventId) || !isPreviewId(photoId) || !VARIANTS.includes(variant)) {
    throw new Error("Unknown photo");
  }
  return path.join(FILES, "events", eventId, photoId, `${variant}.jpg`);
}

export async function listPreviewPhotos(eventId?: string) {
  const photos = await readPhotos();
  return photos
    .filter((photo) => !eventId || photo.event_id === eventId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getPreviewPhoto(photoId: string) {
  const photos = await readPhotos();
  return photos.find((photo) => photo.id === photoId) ?? null;
}

export async function createPreviewPhoto(input: {
  eventId: string;
  name: string | null;
  width: number | null;
  height: number | null;
}) {
  return locked(async () => {
    const photos = await readPhotos();
    const photo: PhotoRow = {
      id: randomUUID(),
      event_id: input.eventId,
      original_name: input.name,
      width: input.width,
      height: input.height,
      face_count: 0,
      status: "uploading",
      created_at: new Date().toISOString(),
    };
    photos.unshift(photo);
    await writePhotos(photos);
    return photo;
  });
}

export async function updatePreviewPhoto(
  photoId: string,
  patch: Partial<Pick<PhotoRow, "status" | "face_count">>
) {
  return locked(async () => {
    const photos = await readPhotos();
    const index = photos.findIndex((photo) => photo.id === photoId);
    if (index === -1) return null;
    photos[index] = { ...photos[index], ...patch };
    await writePhotos(photos);
    return photos[index];
  });
}

export async function writePreviewFile(eventId: string, photoId: string, variant: Variant, body: Buffer) {
  const file = previewFilePath(eventId, photoId, variant);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body);
}

export async function readPreviewFile(eventId: string, photoId: string, variant: Variant) {
  try {
    return await fs.readFile(previewFilePath(eventId, photoId, variant));
  } catch {
    return null;
  }
}

async function removePhotoFiles(eventId: string, photoId: string) {
  if (!isPreviewId(eventId) || !isPreviewId(photoId)) return;
  await fs.rm(path.join(FILES, "events", eventId, photoId), { recursive: true, force: true });
}

export async function deletePreviewPhoto(eventId: string, photoId: string) {
  return locked(async () => {
    const photos = await readPhotos();
    const next = photos.filter((photo) => !(photo.id === photoId && photo.event_id === eventId));
    if (next.length === photos.length) return false;
    await writePhotos(next);
    await removePhotoFiles(eventId, photoId);
    return true;
  });
}

export async function deletePreviewPhotosForEvent(eventId: string) {
  return locked(async () => {
    const photos = await readPhotos();
    const removed = photos.filter((photo) => photo.event_id === eventId);
    await writePhotos(photos.filter((photo) => photo.event_id !== eventId));
    await Promise.all(removed.map((photo) => removePhotoFiles(eventId, photo.id)));
  });
}
