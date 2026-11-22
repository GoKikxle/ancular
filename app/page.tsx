import Link from "next/link";
import { MarketingFooter } from "@/components/landing/MarketingFooter";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { AudienceTabs } from "@/components/marketing/AudienceTabs";
import { FaqList } from "@/components/marketing/FaqList";
import { FeatureAccordion } from "@/components/marketing/FeatureAccordion";
import { HOME_FAQS } from "@/components/marketing/faqs";
import { HeroOrbit } from "@/components/landing/HeroOrbit";
import { HeroProduct } from "@/components/marketing/HeroProduct";
import { QrArt } from "@/components/marketing/QrArt";
import {
  FREE_LIVE_EVENTS_PER_MONTH,
  FREE_PHOTOS_PER_EVENT,
  PASS_PHOTOS_PER_EVENT,
  PRICES,
  formatMoney,
} from "@/lib/plans";

const n = (x: number) => x.toLocaleString("en-GB");

const FEATURES = [
  {
    title: "Every guest gets only their photos",
    body: "Guests take one selfie and see the photos they appear in, ready to save or share. Nobody scrolls through thousands of strangers to find themselves.",
    img: "/landing/v3/6265966.webp",
    alt: "A guest at a party taking a selfie",
    pos: "center 30%",
  },
  {
    title: "Private by default, not by setting",
    body: "Events are invite only, hosts can approve each guest, and there is no public gallery. What happens at the event stays with the people who were there.",
    img: "/landing/hq/weddings.webp",
    alt: "Bride and groom dancing while guests film them on their phones",
  },
  {
    title: "Upload once, matched automatically",
    body: "Photographers and media teams upload to one event, over one day or several. Faces are matched as the photos land, so guests can search the same evening.",
    img: "/landing/steps/upload.webp",
    alt: "A photographer checking his camera",
  },
  {
    title: "Collections that survive the night",
    body: "Each guest's photos are saved to their account, so a dropped signal, a new phone or a busy evening doesn't mean starting again.",
    img: "/landing/v3/18148376.webp",
    alt: "Hands holding a phone showing a photo at night",
  },
];

const STEPS = [
  {
    n: "01",
    who: "Host",
    title: "Create the event and upload",
    body: "Add the photographer's photos as they come in. Ancular finds every face as each photo lands.",
    img: "/landing/v3/16313530.webp",
  },
  {
    n: "02",
    who: "Host",
    title: "Share one invite link",
    body: "Print the code on the programme, show it on screen or post it to your guest list. Only people with it can ask to join.",
    img: null,
  },
  {
    n: "03",
    who: "Guest",
    title: "Take one selfie",
    body: "Each guest sees every photo they're in, on their own phone, with nothing to download or install.",
    img: "/landing/steps/selfie.webp",
  },
];

export default function Home() {
  const gbp = PRICES.GBP;
  return (
    <div className="lp v3">
      <MarketingHeader />

      <main>
        {/* ---------- Hero ---------- */}
        <section className="v3-wrap v3-hero">
          <p className="v3-eyebrow reveal-up">Ancular for events</p>
          <h1
            className="v3-display reveal-up"
            style={{ animationDelay: "60ms" }}
          >
            Every guest. Every photo. Delivered privately.
          </h1>
          <p className="v3-lead reveal-up" style={{ animationDelay: "120ms" }}>
            Ancular matches your event photos to the people in them, so every
            guest receives their own album and nobody sees a gallery of
            strangers.
          </p>
          <div
            className="reveal-up mt-9 flex flex-wrap justify-center gap-2"
            style={{ animationDelay: "180ms" }}
          >
            <Link href="/signup" className="lp-btn lp-btn-ink">
              Start free
            </Link>
            <a
              href="mailto:hello@ancular.com?subject=Ancular%20for%20our%20events"
              className="lp-btn v3-btn-line"
            >
              Talk to us
            </a>
          </div>
          <div
            className="v3-hero-orbit reveal-up"
            style={{ animationDelay: "260ms" }}
          >
            <HeroOrbit />
          </div>
        </section>

        {/* ---------- The problem ---------- */}
        <section className="v3-wrap v3-sec">
          <div className="v3-split">
            <h2 className="v3-h2">
              Event photos are a promise most events don&apos;t keep.
            </h2>
            <div className="v3-body space-y-5">
              <p>
                A photographer captures thousands of moments. Then the gallery
                link goes out, and it quietly fails: guests won&apos;t scroll
                through four thousand photos to find the six they&apos;re in,
                and most never ask.
              </p>
              <p>
                For an organiser, that&apos;s the last impression of the event.
                For a client, it&apos;s money spent on photography that nobody
                sees. Ancular closes that gap by giving every guest their
                photos, privately, the same day.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- The product ---------- */}
        <section className="v3-wrap pb-8">
          <HeroProduct />
        </section>

        {/* ---------- Features ---------- */}
        <section id="features" className="v3-wrap v3-sec scroll-mt-24">
          <div className="v3-head">
            <h2 className="v3-h2">
              Deliver photos the way your clients expect
            </h2>
            <p className="v3-lead-left">
              A delivery that feels as considered as the event itself.
            </p>
          </div>
          <FeatureAccordion items={FEATURES} tint="var(--c-yellow)" />
        </section>

        {/* ---------- Who it's for ---------- */}
        <section id="solutions" className="v3-wrap v3-sec scroll-mt-24">
          <div className="v3-head">
            <h2 className="v3-h2">Built for the people who run events</h2>
            <p className="v3-lead-left">
              From a single wedding to a season of conferences.
            </p>
          </div>
          <AudienceTabs />
        </section>

        {/* ---------- How it works ---------- */}
        <section id="how-it-works" className="v3-wrap v3-sec scroll-mt-24">
          <div className="v3-head">
            <h2 className="v3-h2">Live in three steps</h2>
            <p className="v3-lead-left">
              Set up in minutes. Nothing for guests to install.
            </p>
          </div>
          <ol className="v3-steps">
            {STEPS.map((s) => (
              <li key={s.n} className="v3-card v3-step">
                <div className="v3-step-media">
                  {s.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.img} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <QrArt />
                  )}
                </div>
                <div className="v3-step-copy">
                  <p className="v3-caps">
                    {s.n} · {s.who}
                  </p>
                  <h3 className="v3-h4 mt-3">{s.title}</h3>
                  <p className="v3-small mt-3">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Pricing ---------- */}
        <section className="v3-wrap v3-sec">
          <div className="v3-card v3-price">
            <div>
              <h2 className="v3-h3">Ancular pricing</h2>
              <p className="v3-small mt-4">
                Hosts pay for the event. Guests never pay.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                <Link href="/signup" className="lp-btn lp-btn-ink">
                  Start free
                </Link>
                <Link href="/pricing" className="lp-btn lp-btn-quiet">
                  See pricing
                </Link>
              </div>
            </div>
            <div>
              <p className="v3-body">
                Start on Free, unlock a single event when it needs more photos,
                or go Pro if you host often.
              </p>
              <ul className="v3-price-points">
                <li>
                  <strong>Free</strong> · {FREE_LIVE_EVENTS_PER_MONTH} live
                  events a month, {n(FREE_PHOTOS_PER_EVENT)} photos each
                </li>
                <li>
                  <strong>Event pass</strong> · {formatMoney(gbp.pass, "GBP")}{" "}
                  once, up to {n(PASS_PHOTOS_PER_EVENT)} photos
                </li>
                <li>
                  <strong>Pro</strong> · {formatMoney(gbp.pro, "GBP")} a month,
                  unlimited live events
                </li>
                <li>
                  <strong>Large events</strong> · set up with our team
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section id="faq" className="v3-wrap v3-sec scroll-mt-24">
          <div className="v3-split v3-split-top">
            <div>
              <h2 className="v3-h2">Frequently asked questions</h2>
              <p className="v3-small mt-5">
                More on plans in{" "}
                <Link
                  href="/pricing#faq"
                  className="font-medium text-ink underline underline-offset-4"
                >
                  pricing
                </Link>
                , or email{" "}
                <a
                  href="mailto:hello@ancular.com"
                  className="font-medium text-ink underline underline-offset-4"
                >
                  hello@ancular.com
                </a>
                .
              </p>
            </div>
            <FaqList items={HOME_FAQS} />
          </div>
        </section>

        {/* ---------- Closing ---------- */}
        <section className="v3-wrap v3-close">
          <h2 className="v3-display">Give every guest their photos.</h2>
          <p className="v3-lead">
            Start free on your next event, or talk to us about a larger one.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-2">
            <Link href="/signup" className="lp-btn lp-btn-ink">
              Start free
            </Link>
            <a
              href="mailto:hello@ancular.com?subject=Ancular%20for%20our%20events"
              className="lp-btn v3-btn-line"
            >
              Talk to us
            </a>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
