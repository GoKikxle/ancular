import Link from "next/link";
import { HeroOrbit } from "@/components/landing/HeroOrbit";
import { MarketingFooter } from "@/components/landing/MarketingFooter";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { UseCases } from "@/components/landing/UseCases";
import { WordReveal } from "@/components/landing/WordReveal";

const promises = [
  {
    title: "Your selfie stays on your phone",
    body: "Ancular reads a face code from it on your device, searches once, and doesn't keep it.",
  },
  {
    title: "Invite only",
    body: "Nobody can open an event without the host's link, and hosts can approve each guest.",
  },
  {
    title: "You only see photos you're in",
    body: "Guests can't scroll through other people's pictures.",
  },
  {
    title: "Face data deletes itself",
    body: "It's removed after the event, 30 days by default, and you can delete yours any time.",
  },
];

/* ---------- Small pictures for the three steps ---------- */

function UploadArt() {
  const files = ["festival", "wedding", "conference", "rave", "church", "tech"];
  return (
    <div className="step-art">
      <div className="grid w-full grid-cols-3 gap-1.5">
        {files.map((f, i) => (
          <div key={f} className="relative aspect-square overflow-hidden rounded-[10px] bg-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/landing/${f}-600.webp`} alt="" loading="lazy" className="h-full w-full object-cover" />
            <span className="step-facebox" style={{ animationDelay: `${i * 0.35}s` }} />
          </div>
        ))}
      </div>
      <div className="mt-3 w-full">
        <div className="flex justify-between text-[11px] font-semibold text-ink-3">
          <span>Finding faces</span>
          <span className="lp-mono">auto</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[rgba(0,0,0,0.08)]">
          <div className="step-bar h-full rounded-full bg-ink" />
        </div>
      </div>
    </div>
  );
}

function ShareArt() {
  // A decorative QR-style code: three corner squares and a fixed scatter of dots.
  const N = 21;
  const finder = (x: number, y: number) => {
    for (const [fx, fy] of [[0, 0], [N - 7, 0], [0, N - 7]]) {
      const dx = x - fx;
      const dy = y - fy;
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) {
        const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        return ring === 3 || ring <= 1 ? 1 : 0;
      }
      if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) return 0;
    }
    return null;
  };
  const cells: number[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) cells.push(finder(x, y) ?? ((x * 7 + y * 13 + x * y) % 5 < 2 ? 1 : 0));
  return (
    <div className="step-art">
      <div className="w-[52%] rounded-[14px] bg-white p-[7%] shadow-[0_1px_0_rgba(0,0,0,0.04),0_10px_30px_-12px_rgba(0,0,0,0.25)]">
        <svg viewBox={`0 0 ${N} ${N}`} className="block w-full" shapeRendering="crispEdges" aria-hidden="true">
          {cells.map((c, i) => (c ? <rect key={i} x={i % N} y={Math.floor(i / N)} width="1" height="1" /> : null))}
        </svg>
      </div>
      <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold shadow-[0_1px_0_rgba(0,0,0,0.04),0_6px_20px_-10px_rgba(0,0,0,0.3)]">
        <span className="lp-mono text-ink-3">ancular.com/e/</span>
        <span>your-event</span>
      </span>
    </div>
  );
}

function SelfieArt() {
  return (
    <div className="step-art">
      <div className="relative grid aspect-square w-[52%] place-items-center rounded-full bg-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)]">
        <span className="step-scan" />
        <svg viewBox="0 0 48 48" className="h-[42%] w-[42%] text-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="24" cy="18" r="8" />
          <path d="M9 41c2.6-7.6 8.4-11 15-11s12.4 3.4 15 11" />
        </svg>
      </div>
      <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-[12px] font-semibold text-white">
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
        Your photos are ready
      </span>
    </div>
  );
}

const steps = [
  {
    who: "Host",
    title: "Upload the day's photos",
    body: "The photographer or media team uploads everything. Ancular finds the faces as the photos go up.",
    Art: UploadArt,
  },
  {
    who: "Host",
    title: "Share one invite link",
    body: "Put the code on the programme, the big screen or the group chat. Only people with it can ask to join.",
    Art: ShareArt,
  },
  {
    who: "Guest",
    title: "Take one selfie",
    body: "Each guest sees only the photos they're in, ready to save or send on WhatsApp. No app to download.",
    Art: SelfieArt,
  },
];

export default function Home() {
  return (
    <div className="lp">
      <MarketingHeader />

      <main>
        {/* ---------- Hero: the one thing Ancular does, for any event ---------- */}
        <section className="lp-hero">
          <div className="lp-hero-art">
            <HeroOrbit />
          </div>
          <div className="lp-hero-copy">
            <h1 className="lp-display reveal-up">
              Every photo of you,
              <br />
              <span className="text-ink-4">found with one selfie.</span>
            </h1>
            <div className="lp-hero-side reveal-up" style={{ animationDelay: "120ms" }}>
              <p className="lp-lead">
                Private photo sharing for events too big for a group chat. Guests take one selfie and see only the photos
                they&apos;re in.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/signup" className="btn btn-primary btn-pill btn-lg">
                  Start free
                  <Arrow />
                </Link>
                <a href="#how-it-works" className="btn btn-quiet btn-pill btn-lg">
                  How it works
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- The problem, inked in as you scroll ---------- */}
        <section className="lp-wrap py-24 md:py-40">
          <p className="lp-label mb-8">The problem</p>
          <WordReveal
            className="lp-statement"
            text="Thousands of photos. Hundreds of guests. Nobody scrolls that far. A shared gallery is where event photos go to be forgotten, so Ancular does the searching for each guest."
          />
        </section>

        {/* ---------- How it works ---------- */}
        <section id="how-it-works" className="lp-wrap scroll-mt-20">
          <div className="lp-panel">
            <div className="max-w-2xl">
              <p className="lp-label">How it works</p>
              <h2 className="lp-h2 mt-5">
                Three steps.
                <br />
                <span className="text-ink-4">Nothing to install.</span>
              </h2>
            </div>
            <ol className="mt-12 grid gap-3 md:mt-16 md:grid-cols-3">
              {steps.map(({ who, title, body, Art }, i) => (
                <li key={title} className="lp-card reveal-view">
                  <Art />
                  <div className="mt-6 flex items-center gap-2">
                    <span className="lp-mono text-[12px] text-ink-4">{String(i + 1).padStart(2, "0")}</span>
                    <span className="rounded-full bg-fill px-2 py-0.5 text-[11px] font-semibold text-ink-2">{who}</span>
                  </div>
                  <h3 className="mt-3 text-[1.25rem] font-semibold tracking-[-0.03em]">{title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-[1.45] text-ink-3">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Use cases ---------- */}
        <section id="use-cases" className="lp-wrap scroll-mt-20 py-24 md:py-36">
          <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="lp-label">Use cases</p>
              <h2 className="lp-h2 mt-5">
                One link.
                <br />
                <span className="text-ink-4">Any crowd.</span>
              </h2>
            </div>
            <p className="lp-lead max-w-sm">
              Wherever there&apos;s a photographer and more guests than a group chat can handle.
            </p>
          </div>
          <UseCases />
        </section>

        {/* ---------- Privacy ---------- */}
        <section id="privacy" className="lp-wrap scroll-mt-20">
          <div className="lp-panel lp-panel-dark">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
              <div>
                <p className="lp-label lp-label-dark">Privacy</p>
                <h2 className="lp-h2 mt-5">
                  Private by design.
                  <br />
                  <span className="text-white/40">Built so people can trust it.</span>
                </h2>
                <Link href="/privacy" className="btn btn-pill btn-lg btn-on-indigo mt-10">
                  How we handle your data
                  <Arrow />
                </Link>
              </div>
              <dl className="grid gap-px overflow-hidden rounded-[24px] bg-white/10 sm:grid-cols-2">
                {promises.map((p, i) => (
                  <div key={p.title} className="bg-[#111] p-6 md:p-8">
                    <span className="lp-mono text-[12px] text-white/40">{String(i + 1).padStart(2, "0")}</span>
                    <dt className="mt-6 text-[1.0625rem] font-semibold tracking-[-0.02em] text-white">{p.title}</dt>
                    <dd className="mt-2 text-[0.9375rem] leading-[1.45] text-white/55">{p.body}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ---------- Closing ---------- */}
        <section className="lp-wrap py-28 text-center md:py-44">
          <h2 className="lp-display mx-auto max-w-[14ch]">
            Everyone leaves with <span className="text-ink-4">their pictures.</span>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            <Link href="/signup" className="btn btn-primary btn-pill btn-lg">
              Start free
              <Arrow />
            </Link>
            <Link href="/login" className="btn btn-quiet btn-pill btn-lg">
              I have an account
            </Link>
          </div>
          <p className="t-meta mt-5">
            Free covers 3 live events a month and 200 photos per event.{" "}
            <Link href="/pricing" className="font-semibold text-ink underline underline-offset-4">
              See pricing
            </Link>
          </p>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="lp-arrow h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
