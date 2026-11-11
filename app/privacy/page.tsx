import type { Metadata } from "next";
import { MarketingFooter } from "@/components/landing/MarketingFooter";
import { MarketingHeader } from "@/components/landing/MarketingHeader";

export const metadata: Metadata = { title: "Privacy" };

const sections = [
  {
    title: "What Ancular does",
    body: [
      "Hosts (organisers, churches, photographers, couples) upload photos from an event. Guests who have the host's invite link can join the event and find the photos they appear in by taking a selfie.",
      "Ancular is available in the United Kingdom and Nigeria. This page covers both: the UK GDPR and the Data Protection Act 2018 in the UK, and the Nigeria Data Protection Act 2023 (NDPA) in Nigeria.",
      "Ancular is registered with the UK Information Commissioner's Office as a data controller, registration reference ZC297871. Questions about your data go to privacy@ancular.com.",
    ],
  },
  {
    title: "Face data and how it's made",
    body: [
      "To match a selfie to event photos, Ancular turns each face into a face code: a list of numbers that describes the shape of a face. Face codes are biometric data. UK GDPR treats them as special category data, and the Nigeria Data Protection Act 2023 treats them as sensitive personal data.",
      "Face codes for event photos are created in the host's browser while the photos upload, and stored with the event.",
      "Your selfie is read on your own phone. The image is never uploaded. Only its face code is sent to search the event once, and it isn't saved.",
    ],
  },
  {
    title: "Your consent",
    body: [
      "Ancular only searches for you after you tick the face matching box for that event. That tick is your explicit consent, which is the legal basis we rely on for face matching under the UK GDPR (Article 9) and the NDPA. We record when you agreed and the wording you agreed to.",
      "Saying no is fine. You can still be in the event; you just won't be able to search by selfie.",
      "You can withdraw at any time from the event page. That deletes your search results for the event straight away.",
    ],
  },
  {
    title: "Who can see what",
    body: [
      "Events are invite only. Nobody can open an event without the host's link, and hosts can choose to approve each guest.",
      "Guests only see photos they appear in. Hosts see all the photos they uploaded and the list of guests who joined.",
    ],
  },
  {
    title: "How long we keep it",
    body: [
      "Face codes for an event are deleted automatically after the host's retention period, 30 days after the event by default. Hosts can delete an event, and everything in it, at any time.",
    ],
  },
  {
    title: "People who didn't sign up",
    body: [
      "Event photos include people who never use Ancular. Their face codes are only ever compared against a guest's selfie; they are never named, tagged or shown to anyone else, and they are deleted with the rest of the event's face data. Hosts confirm that guests were told photos would be shared this way. If you'd like to be removed from an event, contact the host or us.",
    ],
  },
  {
    title: "Where your data is kept",
    body: [
      "Your account, event details and face codes are stored with Supabase in the European Union (Ireland). Photos are stored with our storage provider, and the website is served by Vercel. These providers only process data to run Ancular, under data processing agreements.",
      "For users in Nigeria this is a transfer outside Nigeria, and for users in the UK a transfer to the EU. Both are made with the safeguards the NDPA and the UK GDPR require.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "Wherever you are, you can ask to see the data we hold about you, correct it, delete it, or get a copy, and you can withdraw consent at any time. Most of this you can do yourself: withdraw on the event page, or clear your search data or delete your account in Settings.",
      "For anything else, contact us at privacy@ancular.com. We reply within one month.",
      "If you're unhappy with how we handle your data, you can complain to the regulator: the Information Commissioner's Office (ico.org.uk) in the UK, or the Nigeria Data Protection Commission (ndpc.gov.ng) in Nigeria.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    body: [
      "Ancular uses essential cookies only: small files that keep you signed in and keep your session secure (they start with \"sb-\" and come from our sign-in provider, Supabase). Without them you couldn't sign in, so they don't need your consent.",
      "We don't use advertising cookies, and we don't track you across other sites. Your cookie choice is saved on your device, and you can change it any time from \"Cookie settings\" at the bottom of the page. If we ever add optional analytics, we'll only load them if you choose \"Accept all\".",
    ],
  },
  {
    title: "Children",
    body: [
      "Only adults can create an account. Parents and guardians can search on behalf of their children.",
    ],
  },
];

const short = [
  "Your selfie is read on your phone and never uploaded.",
  "Face matching only happens after you agree, per event.",
  "Guests only see photos they appear in.",
  "Face data is deleted after the event, 30 days by default.",
];

function slug(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function PrivacyPage() {
  const items = sections.map((s) => ({ ...s, anchor: "id" in s && s.id ? s.id : slug(s.title) }));
  return (
    <div className="lp">
      <MarketingHeader base="/" />
      <main>
        <section className="lp-wrap pb-14 pt-28 md:pb-20 md:pt-40">
          <p className="lp-label reveal-up">Privacy</p>
          <h1 className="lp-display reveal-up mt-6 max-w-[15ch]" style={{ animationDelay: "60ms" }}>
            How Ancular handles <span className="text-ink-4">your data.</span>
          </h1>
          <p className="lp-lead reveal-up mt-8 max-w-lg" style={{ animationDelay: "120ms" }}>
            The plain-language version, for people in the United Kingdom and Nigeria. If anything here is unclear, ask
            us at{" "}
            <a href="mailto:privacy@ancular.com" className="font-semibold text-ink underline underline-offset-4">
              privacy@ancular.com
            </a>{" "}
            and we&apos;ll explain.
          </p>
        </section>

        <section className="lp-wrap">
          <div className="lp-panel lp-panel-dark !pb-8 md:!pb-12">
            <p className="lp-label lp-label-dark">The short version</p>
            <ul className="mt-8 grid gap-px overflow-hidden rounded-[22px] bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {short.map((t, i) => (
                <li key={t} className="bg-[#111] p-6">
                  <span className="lp-mono text-[12px] text-white/40">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-6 text-[1.0625rem] font-semibold leading-[1.3] tracking-[-0.02em] text-white">{t}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="lp-wrap py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-20">
            <nav aria-label="On this page" className="lp-toc hidden lg:block">
              <div className="sticky top-24">
                <p className="lp-label mb-4">On this page</p>
                {items.map((s) => (
                  <a key={s.anchor} href={`#${s.anchor}`}>
                    {s.title}
                  </a>
                ))}
              </div>
            </nav>
            <div>
              {items.map((s, i) => (
                <section
                  key={s.anchor}
                  id={s.anchor}
                  className="grid scroll-mt-24 gap-4 border-t border-hairline py-10 first:border-t-0 first:pt-0 md:grid-cols-[1fr_1.6fr] md:gap-10 md:py-12"
                >
                  <div>
                    <span className="lp-mono text-[12px] text-ink-4">{String(i + 1).padStart(2, "0")}</span>
                    <h2 className="mt-3 text-[1.5rem] font-medium leading-[1.1] tracking-[-0.035em]">{s.title}</h2>
                  </div>
                  <div className="lp-prose max-w-2xl text-[1rem] leading-[1.6] text-ink-2">
                    {s.body.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
