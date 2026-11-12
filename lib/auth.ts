import type { User } from "@supabase/supabase-js";

/** True when the account has confirmed email (or phone, for later Termii sign-in). */
export function isEmailVerified(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.email_confirmed_at) return true;
  // Future phone sign-in: confirmed phone counts once we add it.
  if (!user.email && user.phone_confirmed_at) return true;
  return false;
}

/** Safe internal redirect path. */
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard") {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return fallback;
}

export function confirmEmailHref(next?: string | null) {
  return `/confirm-email?next=${encodeURIComponent(safeNextPath(next))}`;
}

/** Friendly copy when Supabase rejects an unconfirmed login. */
export function isUnconfirmedEmailError(message: string | null | undefined) {
  return /email\s*(not\s*)?confirm|confirm(ation)?\s*(of\s*)?your\s*email|not\s*verified/i.test(message ?? "");
}
