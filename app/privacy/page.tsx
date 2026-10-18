import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
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
      "To match a selfie to event photos, Ancular turns each face into a face code: a list of 128 numbers that describes the shape of a face. Face codes are biometric data, which Nigerian law (the Nigeria Data Protection Act 2023) treats as sensitive personal data.",
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
      <header className="border-b border-line bg-paper">
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
          <Logo />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
        <h1 className="display text-[2.6rem] text-indigo sm:text-[3.2rem]">How Ancular handles your data</h1>
        <p className="mt-4 text-lg text-ink-muted">
          The plain-language version. If anything here is unclear, ask us and we&apos;ll explain.
        </p>
        <div className="mt-12 space-y-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-2xl font-bold text-indigo">{s.title}</h2>
              <div className="mt-3 space-y-3 text-[1.05rem] leading-relaxed">
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
