import { createOgCover, ogAlt, ogContentType, ogSize } from "@/lib/brand/og-cover";

export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return createOgCover();
}
