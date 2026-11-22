import Link from "next/link";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { HeroOrbit } from "@/components/landing/HeroOrbit";
import { MarketingFooter } from "@/components/landing/MarketingFooter";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { IconDot, type PixelIconName } from "@/components/landing/PixelIcon";
import { UseCaseCards } from "@/components/landing/UseCaseCards";

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

const promises: { icon: PixelIconName; color: string; title: string; body: string }[] = [
  {
    icon: "phone",
    color: "var(--c-purple)",
    title: "Your selfie stays on your phone",
    body: "Ancular reads a face code from it on your device, searches once, and doesn't keep it.",
  },
  {
    icon: "lock",
    color: "var(--c-yellow)",
    title: "Invite only",
    body: "Nobody can open an event without the host's link, and hosts can approve each guest.",
  },
  {
    icon: "eye",
    color: "var(--c-pink)",
    title: "You only see photos you're in",
    body: "Guests can't scroll through other people's pictures.",
  },
  {
    icon: "clock",
    color: "var(--c-mint)",
    title: "Face data deletes itself",
    body: "It's removed after the event, 30 days by default, and you can delete yours any time.",
  },
];

/** Building the page one section at a time: only sections up to STEP are shown. */
const STEP: number = 4;

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

        {STEP > 1 && (
          <>
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

          </>
        )}

        {STEP > 2 && (
          <>
        {/* ---------- How it works ---------- */}
        <section id="how-it-works" className="lp-wrap scroll-mt-10 py-16 md:py-24">
          <HowItWorks />
        </section>
          </>
        )}

        {STEP > 3 && (
          <>
        {/* ---------- Use cases ---------- */}
        <section id="use-cases" className="scroll-mt-10 py-20 md:py-32">
          <div className="lp-wrap mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="lp-h2">
                One link. <span className="lp-serif text-purple">Any</span> crowd.
              </h2>
            </div>
            <p className="lp-lead max-w-sm">Wherever there&apos;s a photographer and more guests than a group chat can handle.</p>
          </div>
          <UseCaseCards />
        </section>

          </>
        )}

        {STEP > 4 && (
          <>
        {/* ---------- Privacy ---------- */}
        <section id="privacy" className="lp-dark scroll-mt-0">
          <div className="lp-wrap py-24 md:py-36">
            <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
              <div>
                <p className="lp-label lp-label-dark">Privacy</p>
                <h2 className="lp-h2 mt-5">
                  Private by <span className="lp-serif text-lavender">design.</span>
                  <br />
                  <span className="text-white/45">Built so people can trust it.</span>
                </h2>
                <Link href="/privacy" className="lp-btn lp-btn-white mt-10">
                  How we handle your data
                </Link>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                {promises.map((p) => (
                  <div key={p.title} className="lp-dark-card reveal-view">
                    <IconDot name={p.icon} color={p.color} size={52} />
                    <dt className="mt-8 text-[1.125rem] font-medium tracking-[-0.02em] text-white">{p.title}</dt>
                    <dd className="mt-2 text-[0.9375rem] leading-[1.5] text-white/55">{p.body}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
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
          </>
        )}
      </main>

      <MarketingFooter />
    </div>
  );
}
