/**
 * Returns the canonical site URL for auth redirects, emails, etc.
 * Never use window.location or localhost in production flows.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (explicit config)
 * 2. NEXT_PUBLIC_VERCEL_URL (Vercel automatic, add https)
 * 3. http://localhost:3000 (local dev)
 *
 * Always returns URL with protocol and trailing slash for path concatenation.
 */
export function getURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000");

  url = url.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url.replace(/\/+$/, "") + "/";
}
