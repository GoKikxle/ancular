import type { DbDocument } from "@/lib/documents";

export type DocumentViewKind = "pdf" | "image" | "unsupported";

function extensionFromPath(pathOrUrl: string): string {
  const base = pathOrUrl.split("?")[0]?.split("#")[0] ?? "";
  const parts = base.split(".");
  if (parts.length < 2) return "";
  return (parts.pop() ?? "").toLowerCase();
}

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "avif"]);
const UNSUPPORTED_IMAGE_EXT = new Set(["heic", "heif"]);

/**
 * Infer how we can display a document: PDF embed, <img>, or fallback UI.
 * Uses mime_type first, then file_name / file_url extension.
 */
export function getDocumentViewKind(
  doc: Pick<DbDocument, "mime_type" | "file_name" | "file_url">
): DocumentViewKind {
  const mime = (doc.mime_type ?? "").toLowerCase().trim();
  const ext =
    extensionFromPath(doc.file_name ?? "") || extensionFromPath(doc.file_url ?? "");

  if (mime === "application/pdf" || mime.endsWith("/pdf")) return "pdf";
  if (mime.startsWith("image/")) {
    if (mime.includes("heic") || mime.includes("heif")) return "unsupported";
    return "image";
  }

  if (ext === "pdf") return "pdf";
  if (UNSUPPORTED_IMAGE_EXT.has(ext)) return "unsupported";
  if (IMAGE_EXT.has(ext)) return "image";

  return "unsupported";
}

/** Short label for subtitle (e.g. PDF, PNG, File). */
export function getFileTypeDisplayLabel(
  doc: Pick<DbDocument, "mime_type" | "file_name" | "file_url">
): string {
  const mime = (doc.mime_type ?? "").toLowerCase().trim();
  const map: Record<string, string> = {
    "application/pdf": "PDF",
    "image/jpeg": "JPEG",
    "image/jpg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WebP",
    "image/gif": "GIF",
    "image/svg+xml": "SVG",
    "image/avif": "AVIF",
  };
  if (mime && map[mime]) return map[mime];
  if (mime.startsWith("image/")) return mime.split("/")[1]?.toUpperCase() ?? "Image";

  const ext =
    extensionFromPath(doc.file_name ?? "") || extensionFromPath(doc.file_url ?? "");
  if (ext) return ext.toUpperCase();
  return "File";
}
