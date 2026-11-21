import "server-only";

/**
 * Who can open /admin: the emails in ADMIN_EMAILS (comma separated), set in Vercel.
 * With none set, nobody can.
 */
export function isAdmin(email: string | null | undefined) {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
