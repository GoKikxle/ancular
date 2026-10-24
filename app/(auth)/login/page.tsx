import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { continueWithoutAccountHref, safeInvitePath } from "@/lib/preview-guest";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const invited = !!safeInvitePath(next);
  return (
    <>
      <h1 className="display">Welcome back</h1>
      <p className="t-lead t-muted mb-8 mt-5">
        {invited ? "Sign in to open your invite and find your photos." : "Sign in to your events."}
      </p>
      <AuthForm
        mode="login"
        next={next ?? "/dashboard"}
        initialError={error ? "That sign-in link didn't work or has expired. Request a new one." : undefined}
      />
      {process.env.NODE_ENV === "development" && (
        <p className="t-meta mt-6">
          <Link href={continueWithoutAccountHref(next)} className="underline underline-offset-4 hover:text-ink">
            Continue without an account
          </Link>
        </p>
      )}
    </>
  );
}
