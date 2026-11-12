import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ConfirmEmailPanel } from "@/components/auth/ConfirmEmailPanel";
import { isEmailVerified, safeNextPath } from "@/lib/auth";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Confirm your email" };

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: rawNext } = await searchParams;
  const next = safeNextPath(rawNext);
  const { user } = await getUser();

  if (user && isEmailVerified(user)) {
    redirect(next);
  }

  // Signed-out visitors can still resend if they know their email.
  return (
    <>
      <h1 className="display">Check your inbox</h1>
      <p className="t-lead t-muted mb-8 mt-5">
        Confirm your email to host events or open an invite. The link opens Ancular again on this phone.
      </p>
      <ConfirmEmailPanel
        email={user?.email}
        next={next}
        note={
          next.startsWith("/e/")
            ? "Confirm your email, then you’ll return to your invite to find your photos."
            : undefined
        }
      />
      {!user && (
        <p className="t-meta mt-6">
          Wrong page? Start again from{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="underline underline-offset-4"
          >
            create account
          </Link>
          .
        </p>
      )}
    </>
  );
}
