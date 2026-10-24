import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WaitlistForm } from "./WaitlistForm";

export const metadata: Metadata = { title: "Join the waitlist" };

export default function WaitlistPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader
        action={
          <Link href="/login" className="nav-link">
            Sign in
          </Link>
        }
      />
      <main className="container-page pb-16 pt-10 md:pt-20">
        <div className="max-w-md">
          <h1 className="display">Join the waitlist</h1>
          <div className="mt-5">
            <p className="t-lead">Ancular is in early access for photographers and church media teams.</p>
            <p className="t-lead t-muted">
              Guests don&apos;t need this. If someone sent you an invite, open that link instead.
            </p>
          </div>
          <WaitlistForm />
          <p className="t-meta mt-6">
            Already approved?{" "}
            <Link href="/login" className="font-semibold text-ink underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
