import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { VerifiedBadge, type Verification } from "@/components/guest/VerifiedBadge";

/**
 * Shown when someone opens an invite before the photos are up. Carries the organiser's
 * branding so the link feels intentional, not broken.
 */
export function ComingSoon({
  eventName,
  dateLine,
  hostName,
  logoUrl,
  coverUrl,
  color,
  message,
  verification,
  state,
  next,
}: {
  eventName: string;
  dateLine: string | null;
  hostName: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  color: string | null;
  message: string | null;
  verification: Verification | null;
  /** signed-out: offer to set up now. joined: tell them they're ready. */
  state: "signed-out" | "joined";
  next: string;
}) {
  const accent = color ?? "var(--c-ink)";
  return (
    <div className="cs" style={{ ["--brand" as string]: accent }}>
      <div className="cs-band" />
      <main className="cs-main">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="cs-cover" src={coverUrl} alt="" />
        ) : null}

        <div className="cs-body">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="cs-logo" src={logoUrl} alt={verification?.name ?? hostName ?? eventName} />
          ) : null}

          <p className="cs-eyebrow">
            {eventName}
            {dateLine ? ` · ${dateLine}` : ""}
          </p>
          <h1 className="display mt-3">Photos are on their way</h1>
          <p className="t-lead mt-5">
            {message?.trim() ||
              `The photos from ${eventName} aren't up yet. Check back on this link after the event.`}
          </p>
          <p className="t-lead t-muted mt-3">
            When they&apos;re ready, take one selfie and you&apos;ll see only the photos you&apos;re in.
          </p>

          <div className="mt-6">
            {verification ? (
              <VerifiedBadge v={verification} />
            ) : hostName ? (
              <span className="t-ui">Hosted by {hostName}</span>
            ) : null}
          </div>

          {state === "signed-out" ? (
            <div className="mt-10 flex flex-col gap-2 sm:flex-row">
              <Link href={`/signup?next=${encodeURIComponent(next)}`} className="btn btn-primary btn-lg">
                Get set up now
              </Link>
              <Link href={`/login?next=${encodeURIComponent(next)}`} className="btn btn-quiet btn-lg">
                I have an account
              </Link>
            </div>
          ) : (
            <div className="mt-10">
              <p className="t-ui">You&apos;re in. Come back to this link once the photos are up.</p>
              <Link href={next} className="btn btn-quiet btn-lg mt-4">
                Check again
              </Link>
            </div>
          )}
        </div>
      </main>
      <footer className="cs-foot">
        <span>Private photo finding by</span>
        <Logo href="/" />
      </footer>
    </div>
  );
}
