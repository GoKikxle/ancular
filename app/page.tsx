import Link from "next/link";
import { CrowdGrid } from "@/components/brand/CrowdGrid";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

const steps = [
  {
    title: "Upload the day's photos",
    body: "The photographer or media team uploads everything from the event. Ancular finds the faces as the photos go up.",
  },
  {
    title: "Share one invite link",
    body: "Put the QR code on the programme, the screen or the WhatsApp group. Only people with the link can ask to join, and you can approve each one.",
  },
  {
    title: "Guests take one selfie",
    body: "Each guest sees only the photos they appear in, ready to save to their phone or send on WhatsApp.",
  },
];

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
    body: "It's removed automatically after the event, 30 days by default, and you can delete yours any time.",
  },
];

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-14 border-t border-hairline py-12 md:py-20">
      <div className="grid gap-6 md:grid-cols-[1fr_2fr] md:gap-10">
        <h2 className="t-title">{title}</h2>
        <div>{children}</div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader
        nav={[
          { href: "#how-it-works", label: "How it works" },
          { href: "#privacy", label: "Privacy" },
        ]}
        action={
          <>
            <Link href="/login" className="nav-link">
              Sign in
            </Link>
            <Link href="/waitlist" className="btn btn-primary btn-sm">
              Join the waitlist
            </Link>
          </>
        }
      />

      <main className="container-page">
        <div className="pb-10 pt-10 md:pb-16 md:pt-20">
          <h1 className="display max-w-[13ch]">Every photo of you, found with one selfie.</h1>
          <div className="mt-6 max-w-md">
            <p className="t-lead">Private, invite-only photos for weddings, church programmes and owambes.</p>
            <p className="t-lead t-muted">Each guest sees only the photos they appear in.</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/waitlist" className="btn btn-primary btn-lg">
              Join the waitlist
            </Link>
            <a href="#how-it-works" className="btn btn-quiet btn-lg">
              See how it works
            </a>
          </div>
        </div>

        <CrowdGrid className="pb-8 md:pb-12" />

        <Section title="2,000 photos. 500 guests. Nobody scrolls that far.">
          <p className="t-lead t-muted max-w-xl">
            One shared gallery link is where photos go to be forgotten. Aunty in the orange aso-ebi gives up after
            forty pictures and never finds the three great ones she&apos;s in. Ancular does the searching for her.
          </p>
        </Section>

        <Section id="how-it-works" title="How it works">
          <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            {steps.map((step, i) => (
              <li key={step.title}>
                <span className="t-meta tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="t-item mt-3">{step.title}</h3>
                <p className="t-item-sub mt-1">{step.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Who it's for">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
            <div>
              <h3 className="t-item">Church media teams</h3>
              <p className="t-item-sub mt-1">
                Every Sunday service, vigil and convention gets its own album. Members find their own photos, and your
                team stops answering &ldquo;please send my picture&rdquo; on WhatsApp all week.
              </p>
            </div>
            <div>
              <h3 className="t-item">Photographers</h3>
              <p className="t-item-sub mt-1">
                Deliver to every guest, not just the couple. Each guest who finds their photos sees your name on the
                gallery, and that is how the next booking starts.
              </p>
            </div>
          </div>
        </Section>

        <Section id="privacy" title="Built so families can trust it">
          <dl className="border-t border-hairline">
            {promises.map((p) => (
              <div key={p.title} className="grid gap-1 border-b border-hairline py-4 sm:grid-cols-[1fr_1.4fr] sm:gap-6">
                <dt className="t-item">{p.title}</dt>
                <dd className="t-item-sub">{p.body}</dd>
              </div>
            ))}
          </dl>
          <Link href="/privacy" className="btn btn-quiet btn-sm mt-6">
            Read how we handle your data
          </Link>
        </Section>

        <section className="border-t border-hairline pb-20 pt-12 md:pb-28 md:pt-20">
          <h2 className="display max-w-[16ch]">Your next event can be the one where everyone gets their pictures.</h2>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/waitlist" className="btn btn-primary btn-lg">
              Join the waitlist
            </Link>
            <Link href="/login" className="btn btn-quiet btn-lg">
              I already have an account
            </Link>
          </div>
          <p className="t-meta mt-4">Free while Ancular is in early access.</p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
