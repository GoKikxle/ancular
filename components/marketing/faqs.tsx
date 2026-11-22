import Link from "next/link";
import {
  FREE_LIVE_EVENTS_PER_MONTH,
  FREE_PHOTOS_PER_EVENT,
  PRO_PHOTOS_PER_EVENT,
} from "@/lib/plans";

export type Faq = { q: string; a: React.ReactNode };

const n = (x: number) => x.toLocaleString("en-GB");

export const PRICING_FAQS: Faq[] = [
  {
    q: "Do guests pay anything?",
    a: "Never. Hosts pay for the event. Guests join with the invite link, take a selfie and get their photos for free.",
  },
  {
    q: "Can I try Ancular for free?",
    a: `Yes. Free covers ${FREE_LIVE_EVENTS_PER_MONTH} live events per calendar month and ${n(FREE_PHOTOS_PER_EVENT)} photos per event, with unlimited guests and no card. Anyone can sign up.`,
  },
  {
    q: "What counts as a live event?",
    a: "An event that is still active (not archived or ended). Free counts live events you created in the current calendar month. Guests still join with an invite code only.",
  },
  {
    q: "What counts as an event?",
    a: "One album with its own invite link: a wedding, a conference, a Sunday service, a weekend trip. You can upload to it over several days.",
  },
  {
    q: "What happens if I reach the live-event or photo limit?",
    a: `Nothing already uploaded is lost. At ${FREE_LIVE_EVENTS_PER_MONTH} live events this month, create more after you go Pro or next month. At the photo limit, uploads pause until you add an Event pass to that event or go Pro. Free covers ${n(FREE_PHOTOS_PER_EVENT)} photos per event.`,
  },
  {
    q: "Is the Event pass a subscription?",
    a: "No. It's one payment that raises the photo limit on one event. It doesn't add Free live-event slots. Hosting several events a month? Pro will usually work out cheaper.",
  },
  {
    q: "Can I cancel Pro?",
    a: "Any time, from Settings. Your events and photos stay. New uploads and new live events go back to the Free limits, unless that event has an Event pass.",
  },

  {
    q: `My event has more than ${n(PRO_PHOTOS_PER_EVENT)} photos. What then?`,
    a: (
      <>
        Festivals, conventions and large conferences can go well past that.
        Email us at{" "}
        <a
          href="mailto:hello@ancular.com"
          className="font-semibold text-ink underline underline-offset-4"
        >
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
        Yes. Events are invite only, guests only see photos they&apos;re in, a
        guest&apos;s selfie is read on their own phone and never uploaded, and
        face data is deleted after the event.{" "}
        <Link
          href="/privacy"
          className="font-semibold text-ink underline underline-offset-4"
        >
          Read how we handle data
        </Link>
        .
      </>
    ),
  },
];

/** The homepage FAQ: what organisers and their clients ask before an event. */
export const HOME_FAQS: Faq[] = [
  {
    q: "How does Ancular work?",
    a: "The host creates an event and uploads the photos. Ancular finds the faces as the photos go up. Guests open the invite link, take one selfie, and see only the photos they're in.",
  },
  {
    q: "Do guests need to download an app?",
    a: "No. Guests use the invite link in their phone's browser. They create a quick account so their collection is saved if they lose signal, switch phones or come back the next day.",
  },
  {
    q: "Can guests see other people's photos?",
    a: "No. Each guest sees only the photos they appear in. There is no public gallery to scroll through, and nobody can open an event without the host's invite link.",
  },
  {
    q: "What happens to face data?",
    a: (
      <>
        A guest&apos;s selfie is read on their own phone and never uploaded.
        Face data for an event is deleted after the event, 30 days by default,
        and guests can delete theirs at any time.{" "}
        <Link
          href="/privacy"
          className="font-semibold text-ink underline underline-offset-4"
        >
          Read how we handle data
        </Link>
        .
      </>
    ),
  },
  {
    q: "Who is Ancular for?",
    a: "Event organisers and agencies, photographers and studios, conferences and brands, and faith and community groups. Anyone delivering photos to more guests than a group chat can handle.",
  },
  PRICING_FAQS[0],
  PRICING_FAQS[1],
  {
    q: `We're running a large event. Can you help?`,
    a: (
      <>
        Yes. Festivals, conventions and conferences can go well past{" "}
        {n(PRO_PHOTOS_PER_EVENT)} photos. Email{" "}
        <a
          href="mailto:hello@ancular.com"
          className="font-semibold text-ink underline underline-offset-4"
        >
          hello@ancular.com
        </a>{" "}
        and we&apos;ll set it up with you.
      </>
    ),
  },
];
