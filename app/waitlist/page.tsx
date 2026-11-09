import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter } from "@/components/landing/MarketingFooter";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { WaitlistForm } from "./WaitlistForm";

export const metadata: Metadata = { title: "Join the waitlist" };

const points = [
  {
    title: "Free while in early access",
    body: "Create events and invite guests at no cost while Ancular is in beta.",
  },
  {
    title: "Set up in minutes",
    body: "Upload the photos, share one link. Ancular finds the faces as the photos go up.",
  },
  {
    title: "Private by default",
    body: "Invite only, and each guest sees only the photos they're in.",
  },
];

export default function WaitlistPage() {
  return (
    <div className="lp">
      <MarketingHeader base="/" cta={false} />
      <main className="lp-wrap pb-24 pt-28 md:pb-36 md:pt-40">
        <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,520px)] lg:gap-x-20 lg:gap-y-0">
          <div className="lg:col-start-1 lg:row-start-1">
            <p className="lp-label reveal-up">Early access</p>
            <h1
              className="lp-display reveal-up mt-6"
              style={{ animationDelay: "60ms" }}
            >
              Join the waitlist.
              <br />
              <span className="text-ink-4">Be first in.</span>
            </h1>
            <p
              className="lp-lead reveal-up mt-8 max-w-md"
              style={{ animationDelay: "120ms" }}
            >
              Ancular is opening to hosts in stages: photographers, organisers
              and media teams. Leave your details and we&apos;ll email you when
              you can create events.
            </p>
          </div>

          <ul
            className="reveal-up max-w-md border-t border-hairline max-lg:order-last lg:col-start-1 lg:row-start-2 lg:mt-10 lg:self-start"
            style={{ animationDelay: "180ms" }}
          >
            {points.map((p, i) => (
              <li
                key={p.title}
                className="flex gap-4 border-b border-hairline py-4"
              >
                <span className="lp-mono pt-0.5 text-[12px] text-ink-4">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[0.9375rem] font-semibold tracking-[-0.015em]">
                    {p.title}
                  </p>
                  <p className="mt-0.5 text-[0.9375rem] leading-[1.45] text-ink-3">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div
            className="reveal-up lg:col-start-2 lg:row-span-2 lg:row-start-1"
            style={{ animationDelay: "160ms" }}
          >
            <div className="lp-form-card">
              <WaitlistForm />
            </div>
            <p className="t-meta mt-5 px-2">
              Got an invite from a host? You don&apos;t need this; open their
              link instead. Already approved?{" "}
              <Link
                href="/login"
                className="font-semibold text-ink underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
