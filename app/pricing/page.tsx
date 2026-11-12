import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter } from "@/components/landing/MarketingFooter";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { Plans } from "@/components/pricing/Plans";
import { FREE_PHOTOS_PER_EVENT, PRO_PHOTOS_PER_EVENT } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Hosts pay for the event, never the guests. Start free, unlock one event, or go Pro.",
};

const n = (x: number) => x.toLocaleString("en-GB");

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "Do guests pay anything?",
    a: "Never. Hosts pay for the event. Guests join with the invite link, take a selfie and get their photos for free.",
  },
  {
    q: "Can I try Ancular for free?",
    a: "Yes. The Free plan covers 200 photos per event with unlimited guests, and needs no card. Events created before paid plans started keep full access.",
  },
  {
    q: "What counts as an event?",
    a: "One album with its own invite link: a wedding, a conference, a Sunday service, a weekend trip. You can upload to it over several days.",
  },
  {
    q: "What happens if I reach the photo limit?",
    a: `Nothing is lost. The photos already in stay, and uploads pause until you add an Event pass to that event or go Pro. Free covers ${n(FREE_PHOTOS_PER_EVENT)} photos per event.`,
  },
  {
    q: "Is the Event pass a subscription?",
    a: "No. It's one payment for one event, with no renewal. Hosting several events a month? Pro will usually work out cheaper.",
  },
  {
    q: "Can I cancel Pro?",
    a: "Any time, from Settings. Your events and photos stay. New uploads go back to the Free limit, unless that event has an Event pass.",
  },
  {
    q: "Can I pay in naira?",
    a: "Naira prices are shown above. Naira payments through Paystack are coming soon; until then plans are charged in pounds.",
  },
  {
    q: `My event has more than ${n(PRO_PHOTOS_PER_EVENT)} photos. What then?`,
    a: (
      <>
        Festivals, conventions and large conferences can go well past that. Email us at{" "}
        <a href="mailto:hello@ancular.com" className="font-semibold text-ink underline underline-offset-4">
          hello@ancular.com
        </a>{" "}
        and we&apos;ll set it up with you.
      </>
    ),
  },
  {
    q: "Who owns the photos?",
    a: "You do, along with whoever took them. We only use them to run your event, and you can delete an event and everything in it at any time.",
  },
  {
    q: "Is face matching private?",
    a: (
      <>
        Yes. Events are invite only, guests only see photos they&apos;re in, a guest&apos;s selfie is read on their
        own phone and never uploaded, and face data is deleted after the event.{" "}
        <Link href="/privacy" className="font-semibold text-ink underline underline-offset-4">
          Read how we handle data
        </Link>
        .
      </>
    ),
  },
];

export default function PricingPage() {
  return (
    <div className="lp">
      <MarketingHeader base="/" />
      <main>
        <section className="lp-wrap pb-20 pt-28 md:pb-28 md:pt-40">
          <div className="mx-auto max-w-[1040px]">
            <div className="text-center">
              <p className="lp-label reveal-up">Pricing</p>
              <h1 className="lp-display reveal-up mx-auto mt-6 max-w-[14ch]" style={{ animationDelay: "60ms" }}>
                Pay for the event, <span className="text-ink-4">never the guests.</span>
              </h1>
              <p className="lp-lead reveal-up mx-auto mt-6 max-w-md" style={{ animationDelay: "120ms" }}>
                Start free. Unlock one event, or go Pro if you host often.
              </p>
            </div>
            <div className="reveal-up mt-12 md:mt-16" style={{ animationDelay: "160ms" }}>
              <Plans />
            </div>
            <p className="t-meta mt-8 text-center">
              No card needed for Free. Hosts join through the waitlist.{" "}
              <Link href="/waitlist" className="font-semibold text-ink underline underline-offset-4">
                Join the waitlist
              </Link>
            </p>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 bg-[var(--lp-panel)] py-20 md:py-32">
          <div className="lp-wrap">
            <div className="mx-auto max-w-[768px]">
              <div className="text-center">
                <p className="lp-label">FAQ</p>
                <h2 className="lp-h2 mt-5">
                  Questions? <span className="text-ink-4">Answers.</span>
                </h2>
              </div>
              <div className="mt-12 space-y-2">
                {faqs.map((f, i) => (
                  <details key={f.q} className="faq" open={i === 0}>
                    <summary>
                      <span>{f.q}</span>
                      <span className="faq-icon" aria-hidden="true" />
                    </summary>
                    <div className="faq-a">{f.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
