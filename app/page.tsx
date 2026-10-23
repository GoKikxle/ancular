import Link from "next/link";
import { AdirePattern } from "@/components/brand/AdirePattern";
import { Logo } from "@/components/brand/Logo";
import { SiteFooter } from "@/components/layout/SiteFooter";

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

export default function Home() {
  return (
    <>
      <header className="relative overflow-hidden bg-indigo text-white">
        <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 pt-5 sm:px-6">
          <Logo onIndigo />
          <nav className="flex items-center gap-2">
            <Link href="/login" className="btn btn-sm btn-on-indigo">
              Sign in
            </Link>
          </nav>
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.05fr_1fr] md:pb-24 md:pt-16">
          <div>
            <h1 className="display text-[2.9rem] sm:text-[4.2rem] md:text-[4.6rem]">
              Every photo of you, found with one selfie.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80 sm:text-xl">
              At weddings, church programmes and owambes, hundreds of photos get taken and most guests never see
              theirs. Ancular gives each guest only the photos they appear in. Private and invite-only.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/waitlist" className="btn btn-gold">
                Join the waitlist
              </Link>
              <a href="#how-it-works" className="btn btn-on-indigo">
                See how it works
              </a>
            </div>
          </div>

          <div className="relative">
            <AdirePattern
              className="aspect-[9/7] w-full"
              label="A crowd of adire circles. One is ringed in gold, found by a selfie."
            />
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:gap-16">
            <h2 className="display text-[2.2rem] text-indigo sm:text-[3rem]">
              2,000 photos. 500 guests. Nobody scrolls that far.
            </h2>
            <p className="text-lg text-ink-muted md:pt-3">
              One shared gallery link is where photos go to be forgotten. Aunty in the orange aso-ebi gives up after
              forty pictures and never finds the three great ones she&apos;s in. Ancular does the searching for her.
            </p>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-line bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <h2 className="display text-[2rem] text-indigo sm:text-[2.6rem]">How it works</h2>
            <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((step, i) => (
                <li key={step.title} className="relative">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gold text-lg font-bold text-indigo"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 text-ink-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="grid gap-12 md:grid-cols-2 md:gap-0">
            <div className="md:pr-12">
              <h2 className="display text-[1.9rem] text-indigo sm:text-[2.3rem]">For church media teams</h2>
              <p className="mt-4 text-lg text-ink-muted">
                Every Sunday service, vigil and convention gets its own album. Members find their own photos, and
                your team stops answering &ldquo;please send my picture&rdquo; on WhatsApp all week.
              </p>
            </div>
            <div className="border-line md:border-l md:pl-12">
              <h2 className="display text-[1.9rem] text-indigo sm:text-[2.3rem]">For photographers</h2>
              <p className="mt-4 text-lg text-ink-muted">
                Deliver to every guest, not just the couple. Each guest who finds their photos sees your name on the
                gallery, and that is how the next booking starts.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-indigo-soft">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <h2 className="display max-w-2xl text-[2rem] text-indigo sm:text-[2.6rem]">
              Built so families can trust it
            </h2>
            <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {promises.map((p) => (
                <div key={p.title} className="border-l-[3px] border-gold pl-5">
                  <dt className="text-lg font-bold">{p.title}</dt>
                  <dd className="mt-1 text-ink-muted">{p.body}</dd>
                </div>
              ))}
            </dl>
            <Link href="/privacy" className="mt-10 inline-block font-semibold text-indigo underline underline-offset-4">
              Read how we handle your data
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 md:py-24">
          <h2 className="display mx-auto max-w-3xl text-[2.2rem] text-indigo sm:text-[3rem]">
            Your next event can be the one where everyone gets their pictures.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/waitlist" className="btn btn-primary">
              Join the waitlist
            </Link>
            <Link href="/login" className="btn btn-quiet">
              I already have an account
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-muted">Free while Ancular is in early access.</p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
