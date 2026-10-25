import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = { title: "Privacy" };

const sections = [
  {
    title: "What Ancular does",
    body: [
      "Hosts (couples, churches, photographers, organisers) upload photos from an event. Guests who have the host's invite link can join the event and find the photos they appear in by taking a selfie.",
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
      "Ancular only searches for you after you tick the face matching box for that event. We record when you agreed and the wording you agreed to.",
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
          <p className="t-lead t-muted">If anything here is unclear, ask us and we&apos;ll explain.</p>
        </div>
        <div className="mt-12 md:mt-20">
          {sections.map((s) => (
            <section
              key={s.title}
              className="grid gap-3 border-t border-hairline py-8 md:grid-cols-[1fr_2fr] md:gap-10 md:py-10"
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
