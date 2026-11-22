import Link from "next/link";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { HeroOrbit } from "@/components/landing/HeroOrbit";
import { MarketingFooter } from "@/components/landing/MarketingFooter";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { IconDot, type PixelIconName } from "@/components/landing/PixelIcon";

/* ---------- The colour row, after the screenshot's category circles ---------- */

const CROWDS: { icon: PixelIconName; color: string; label: string; note: string }[] = [
  { icon: "ring", color: "var(--c-pink)", label: "Weddings", note: "Every guest" },
  { icon: "note", color: "var(--c-yellow)", label: "Festivals", note: "Every stage" },
  { icon: "mic", color: "var(--c-purple)", label: "Conferences", note: "Every session" },
  { icon: "laptop", color: "var(--c-blue)", label: "Meetups", note: "Every talk" },
  { icon: "sparkle", color: "var(--c-red)", label: "Parties", note: "Every night" },
  { icon: "cap", color: "var(--c-lavender)", label: "Graduations", note: "Every family" },
  { icon: "people", color: "var(--c-mint)", label: "Communities", note: "Every gathering" },
  { icon: "plane", color: "var(--c-grey)", label: "Trips", note: "Every stop" },
];


export default function Home() {
  return (
    <div className="lp">
      <MarketingHeader />

      <main>
        {/* ---------- Hero ---------- */}
        <section className="lp-hero3">
          <h1 className="lp-display reveal-up">
            Every photo of you,
            <br />
            found with one <span className="lp-serif text-purple">selfie</span>
          </h1>
          <p className="lp-lead reveal-up mx-auto mt-6 max-w-[34ch]" style={{ animationDelay: "120ms" }}>
            Private photo sharing for events too big for a group chat.
          </p>
          <div className="reveal-up mt-8 flex flex-wrap justify-center gap-2" style={{ animationDelay: "220ms" }}>
            <Link href="/signup" className="lp-btn lp-btn-purple">
              Start free
            </Link>
            <a href="#how-it-works" className="lp-btn lp-btn-quiet">
              How it works
            </a>
          </div>
          <div className="lp-hero3-orbit reveal-up" style={{ animationDelay: "320ms" }}>
            <HeroOrbit />
          </div>
        </section>

        {/* ---------- The colour row ---------- */}
        <section id="crowds" className="lp-wrap scroll-mt-10 py-28 md:py-48">
          <h2 className="lp-intro">
            Thousands of photos. Hundreds of guests. Nobody scrolls that far.
            <br />
            Each guest gets <span className="lp-ring">just the photos they&apos;re in.</span>
          </h2>
          <ul className="crowds mt-20 md:mt-32">
            {CROWDS.map((c, i) => (
              <li key={c.label} className="crowd reveal-view" style={{ ["--i" as string]: i }}>
                <IconDot name={c.icon} color={c.color} size={96} className="crowd-dot" />
                <span className="crowd-label">{c.label}</span>
                <span className="crowd-note">{c.note}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- How it works ---------- */}
        <section id="how-it-works" className="lp-wrap scroll-mt-10 py-16 md:py-24">
          <HowItWorks />
        </section>

        {/* ---------- Closing ---------- */}
        <section className="lp-wrap pb-16 pt-28 text-center md:pb-24 md:pt-44">
          <div className="mb-10 flex justify-center -space-x-3">
            {CROWDS.slice(0, 6).map((c) => (
              <IconDot key={c.label} name={c.icon} color={c.color} size={56} className="close-dot" />
            ))}
          </div>
          <h2 className="lp-display mx-auto max-w-[14ch]">
            Everyone leaves with their <span className="lp-serif text-purple">pictures.</span>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            <Link href="/signup" className="lp-btn lp-btn-purple">
              Start free
            </Link>
            <Link href="/login" className="lp-btn lp-btn-quiet">
              I have an account
            </Link>
          </div>
          <p className="mt-5 text-[14px] text-ink-3">
            Free covers 3 live events a month and 200 photos per event.{" "}
            <Link href="/pricing" className="font-medium text-ink underline underline-offset-4">
              See pricing
            </Link>
          </p>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
