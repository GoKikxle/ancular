import "server-only";
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Photo storage.
 * Production: Cloudflare R2 (free downloads). Set the R2_* variables.
 * Without R2 variables it falls back to a private Supabase Storage bucket,
 * which is handy for local development.
 */

export type Variant = "original" | "preview" | "thumb";
export const VARIANTS: Variant[] = ["original", "preview", "thumb"];

export function photoKey(eventId: string, photoId: string, variant: Variant) {
  return `events/${eventId}/${photoId}/${variant}.jpg`;
}

export function eventPrefix(eventId: string) {
  return `events/${eventId}/`;
}

const SUPABASE_BUCKET = process.env.SUPABASE_PHOTOS_BUCKET ?? "event-photos";

function r2() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) return null;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  });
  return { client, bucket: R2_BUCKET };
}

export function storageProvider() {
  return r2() ? "r2" : "supabase";
}

/** A URL the browser can PUT the file body to. */
export async function signUpload(key: string, contentType: string) {
  const r = r2();
  if (r) {
    const url = await getSignedUrl(
      r.client,
      new PutObjectCommand({ Bucket: r.bucket, Key: key, ContentType: contentType }),
      { expiresIn: 60 * 30 }
    );
    return { url, headers: { "Content-Type": contentType } };
  }
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(SUPABASE_BUCKET).createSignedUploadUrl(key, { upsert: true });
  if (error || !data) throw new Error("Could not prepare the upload.");
  return { url: data.signedUrl, headers: { "Content-Type": contentType, "x-upsert": "true" } };
}

/** Longest a signed link can last: R2 (S3) presigned URLs cap at 7 days. */
export const SHARE_LINK_SECONDS = 7 * 24 * 60 * 60;

/** A URL to view or download a stored photo. Short-lived unless a longer life is asked for. */
export async function signDownload(key: string, downloadName?: string, expiresIn = 60 * 10) {
  const r = r2();
  if (r) {
    return getSignedUrl(
      r.client,
      new GetObjectCommand({
        Bucket: r.bucket,
        Key: key,
        ResponseContentDisposition: downloadName ? `attachment; filename="${downloadName}"` : undefined,
        ResponseCacheControl: "private, max-age=3600",
      }),
      { expiresIn }
    );
  }
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(SUPABASE_BUCKET)
    .createSignedUrl(key, expiresIn, downloadName ? { download: downloadName } : undefined);
  if (error || !data) throw new Error("Photo not found.");
  return data.signedUrl;
}

/** Many view links at once: one request to Supabase, or local signing for R2. Missing keys are left out. */
export async function signDownloads(keys: string[], expiresIn = 60 * 60): Promise<Record<string, string>> {
  if (keys.length === 0) return {};
  const r = r2();
  if (r) {
    const pairs = await Promise.all(
      keys.map(async (key) => [
        key,
        await getSignedUrl(
          r.client,
          new GetObjectCommand({ Bucket: r.bucket, Key: key, ResponseCacheControl: "private, max-age=3600" }),
          { expiresIn }
        ),
      ])
    );
    return Object.fromEntries(pairs);
  }
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(SUPABASE_BUCKET).createSignedUrls(keys, expiresIn);
  if (error || !data) return {};
  const out: Record<string, string> = {};
  for (const d of data) if (d.path && d.signedUrl && !d.error) out[d.path] = d.signedUrl;
  return out;
}

/** Delete every object under a prefix (used when an event or photo is deleted). */
export async function deletePrefix(prefix: string) {
  const r = r2();
  if (r) {
    let token: string | undefined;
    do {
      const page = await r.client.send(
        new ListObjectsV2Command({ Bucket: r.bucket, Prefix: prefix, ContinuationToken: token })
      );
      const keys = (page.Contents ?? []).map((o) => ({ Key: o.Key! }));
      if (keys.length) {
        await r.client.send(new DeleteObjectsCommand({ Bucket: r.bucket, Delete: { Objects: keys } }));
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
    return;
  }
  const admin = createAdminClient();
  const bucket = admin.storage.from(SUPABASE_BUCKET);
  // Supabase lists one folder level at a time: events/<event>/ -> <photo>/ -> files
  const base = prefix.replace(/\/$/, "");
  const { data: level1 } = await bucket.list(base, { limit: 1000 });
  const paths: string[] = [];
  for (const entry of level1 ?? []) {
    if (entry.id) {
      paths.push(`${base}/${entry.name}`);
      continue;
    }
    const { data: files } = await bucket.list(`${base}/${entry.name}`, { limit: 100 });
    for (const f of files ?? []) paths.push(`${base}/${entry.name}/${f.name}`);
  }
  for (let i = 0; i < paths.length; i += 500) {
    await bucket.remove(paths.slice(i, i + 500));
  }
}
