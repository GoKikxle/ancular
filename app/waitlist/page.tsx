import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { WaitlistForm } from "./WaitlistForm";

export const metadata: Metadata = { title: "Join the waitlist" };

export default function WaitlistPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-8 sm:px-6">
      <Logo />
      <main className="flex flex-1 flex-col justify-center py-10">
        <h1 className="display text-[2.4rem] text-indigo">Join the waitlist</h1>
        <p className="mt-2 text-ink-muted">
          Ancular is in early access for photographers and church media teams. Guests don't need this. If someone sent
          you an invite, open that link instead.
        </p>
        <WaitlistForm />
        <p className="mt-6 text-sm text-ink-muted">
          Already approved?{" "}
          <Link href="/login" className="font-semibold text-indigo underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
