import Link from "next/link";
import { HeroRow } from "@/components/landing/HeroRow";
import { MarketingFooter } from "@/components/landing/MarketingFooter";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { IconDot, type PixelIconName } from "@/components/landing/PixelIcon";
import { UseCaseCards } from "@/components/landing/UseCaseCards";
import { WordReveal } from "@/components/landing/WordReveal";

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

/* ---------- Collages for the three steps ---------- */

function UploadArt() {
  const shots = [
    { f: "weddings", x: "4%", y: "14%", r: "-7deg", w: "46%" },
    { f: "festivals", x: "50%", y: "4%", r: "5deg", w: "44%" },
    { f: "conferences", x: "28%", y: "44%", r: "-2deg", w: "50%" },
  ];
  return (
    <div className="st-art st-art-lav">
      {shots.map((s, i) => (
        <div key={s.f} className="st-print" style={{ left: s.x, top: s.y, width: s.w, rotate: s.r }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/landing/uc/${s.f}-600.webp`} alt="" loading="lazy" />
          <span className="st-facebox" style={{ animationDelay: `${i * 0.5}s` }} />
        </div>
      ))}
      <span className="lp-chip st-chip" style={{ left: "6%", bottom: "8%", background: "var(--c-mint)" }}>
        Finding faces <span className="lp-mono">✱ auto</span>
      </span>
      <IconDot name="photo" color="var(--c-yellow)" size={64} className="st-sticker px-dot-float" />
    </div>
  );
}

function ShareArt() {
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
    <div className="st-art st-art-yellow">
      <div className="st-qr">
        <svg viewBox={`0 0 ${N} ${N}`} className="block w-full" shapeRendering="crispEdges" aria-hidden="true">
          {cells.map((c, i) => (c ? <rect key={i} x={i % N} y={Math.floor(i / N)} width="1" height="1" /> : null))}
        </svg>
      </div>
      <span className="lp-chip st-chip" style={{ left: "50%", bottom: "12%", translate: "-50% 0", background: "#fff" }}>
        <span className="lp-mono text-ink-4">ancular.com/e/</span>your-event
      </span>
      <span className="lp-oval st-oval">
        <span>✱</span> One link <span>✱</span>
      </span>
      <IconDot name="link" color="var(--c-purple)" size={60} className="st-sticker st-sticker-left px-dot-float" />
    </div>
  );
}

function SelfieArt() {
  const found = [32333369, 32333364, 32333372, 32333376, 32333365, 32333373];
  return (
    <div className="st-art st-art-pink">
      <div className="st-selfie">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/landing/hero/selfie.webp" alt="" loading="lazy" />
        <span className="st-scan" />
      </div>
      <div className="st-found">
        {found.map((id, i) => (
          <span key={id} style={{ animationDelay: `${0.6 + i * 0.12}s` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/landing/hero/${id}.webp`} alt="" loading="lazy" />
          </span>
        ))}
      </div>
      <span className="lp-chip st-chip" style={{ right: "6%", bottom: "8%", background: "var(--c-ink)", color: "#fff" }}>
        12 photos found ✱
      </span>
      <IconDot name="smile" color="var(--c-yellow)" size={64} className="st-sticker st-sticker-top px-dot-float" />
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

/** Building the page one section at a time: only sections up to STEP are shown. */
const STEP: number = 1;

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
          <HeroRow />
        </section>

        {STEP > 1 && (
          <>
        {/* ---------- The colour row ---------- */}
        <section id="crowds" className="lp-wrap scroll-mt-10 py-20 md:py-28">
          <p className="lp-label justify-center">Made for every kind of crowd</p>
          <ul className="crowds mt-10 md:mt-14">
            {CROWDS.map((c, i) => (
              <li key={c.label} className="crowd reveal-view" style={{ ["--i" as string]: i }}>
                <IconDot name={c.icon} color={c.color} size={96} className="crowd-dot" />
                <span className="crowd-label">{c.label}</span>
                <span className="crowd-note">{c.note}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- The problem ---------- */}
        <section className="lp-wrap py-16 md:py-32">
          <p className="lp-label mb-8">The problem</p>
          <WordReveal
            className="lp-statement"
            text="Thousands of photos. Hundreds of guests. Nobody scrolls that far. A shared gallery is where event photos go to be forgotten, so Ancular does the searching for each guest."
          />
        </section>

        {/* ---------- How it works ---------- */}
        <section id="how-it-works" className="lp-wrap scroll-mt-10 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="lp-label">How it works</p>
            <h2 className="lp-h2 mt-5">
              Three steps. <span className="lp-serif text-purple">Nothing</span> to install.
            </h2>
          </div>
          <ol className="mt-14 flex flex-col gap-20 md:mt-24 md:gap-32">
            {steps.map(({ who, title, body, Art }, i) => (
              <li key={title} className={`st-row reveal-view ${i % 2 ? "st-row-flip" : ""}`}>
                <div className="st-copy">
                  <div className="flex items-center gap-3">
                    <span className="lp-mono text-[13px] text-ink-4">{String(i + 1).padStart(2, "0")}</span>
                    <span className="lp-chip !static" style={{ background: who === "Guest" ? "var(--c-pink)" : "var(--c-lavender)" }}>
                      {who}
                    </span>
                  </div>
                  <h3 className="lp-h3 mt-5">{title}</h3>
                  <p className="lp-lead mt-4 max-w-[34ch]">{body}</p>
                </div>
                <Art />
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Use cases ---------- */}
        <section id="use-cases" className="scroll-mt-10 py-20 md:py-32">
          <div className="lp-wrap mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="lp-label">Use cases</p>
              <h2 className="lp-h2 mt-5">
                One link. <span className="lp-serif text-purple">Any</span> crowd.
              </h2>
            </div>
            <p className="lp-lead max-w-sm">Wherever there&apos;s a photographer and more guests than a group chat can handle.</p>
          </div>
          <UseCaseCards />
        </section>

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
