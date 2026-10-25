import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = { title: "Privacy" };

const sections = [
  {
    title: "What Ancular does",
    body: [
      "Hosts (organisers, churches, photographers, couples) upload photos from an event. Guests who have the host's invite link can join the event and find the photos they appear in by taking a selfie.",
      "Ancular is available in the United Kingdom and Nigeria. This page covers both: the UK GDPR and the Data Protection Act 2018 in the UK, and the Nigeria Data Protection Act 2023 (NDPA) in Nigeria.",
    ],
  },
  {
    title: "Face data and how it's made",
    body: [
      "To match a selfie to event photos, Ancular turns each face into a face code: a list of 128 numbers that describes the shape of a face. Face codes are biometric data. UK GDPR treats them as special category data, and the Nigeria Data Protection Act 2023 treats them as sensitive personal data.",
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

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader
        action={
          <Link href="/login" className="nav-link">
            Sign in
          </Link>
        }
      />
      <main className="container-page pb-20 pt-10 md:pt-20">
        <h1 className="display max-w-[14ch]">How Ancular handles your data</h1>
        <div className="mt-6 max-w-md">
          <p className="t-lead">The plain-language version.</p>
          <p className="t-lead t-muted">For people in the United Kingdom and Nigeria. If anything here is unclear, ask us and we&apos;ll explain.</p>
        </div>
        <div className="mt-12 md:mt-20">
          {sections.map((s) => (
            <section
              key={s.title}
              id={"id" in s ? s.id : undefined}
              className="grid scroll-mt-14 gap-3 border-t border-hairline py-8 md:grid-cols-[1fr_2fr] md:gap-10 md:py-10"
            >
              <h2 className="t-title">{s.title}</h2>
              <div className="max-w-2xl space-y-3 text-[0.9375rem] leading-[1.55] text-ink-2">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
