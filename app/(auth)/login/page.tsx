import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const invited = next?.startsWith("/e/");
  return (
    <>
      <h1 className="display text-[2.4rem] text-indigo">Welcome back</h1>
      <p className="mb-8 mt-2 text-ink-muted">
        {invited ? "Sign in to open your invite and find your photos." : "Sign in to your events."}
      </p>
      <AuthForm
        mode="login"
        next={next ?? "/dashboard"}
        initialError={error ? "That sign-in link didn't work or has expired. Request a new one." : undefined}
      />
    </>
  );
}
