import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const invited = next?.startsWith("/e/");
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
    </>
  );
}
