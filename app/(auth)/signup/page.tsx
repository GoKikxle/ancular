import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { continueWithoutAccountHref, safeInvitePath } from "@/lib/preview-guest";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const invited = !!safeInvitePath(next);
  return (
    <>
      <h1 className="display text-[2.4rem] text-indigo">
        {invited ? "Create an account to find your photos" : "Create your Ancular account"}
      </h1>
      <p className="mb-8 mt-2 text-ink-muted">
        {invited
          ? "It takes a minute. You'll use the same account for every event you're invited to."
          : "Host an event, upload the photos and share one link with your guests."}
      </p>
      <AuthForm mode="signup" next={next ?? "/dashboard"} />
      {process.env.NODE_ENV === "development" && (
        <p className="mt-6 text-center text-[0.95rem]">
          <Link href={continueWithoutAccountHref(next)} className="font-semibold text-indigo underline underline-offset-4">
            Continue without an account
          </Link>
        </p>
      )}
    </>
  );
}
