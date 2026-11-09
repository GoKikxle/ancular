/**
 * The hero picture: one guest's selfie in the middle, the party's photos circling it.
 * She's in every one of them, and one by one they light up with the "found" ring,
 * which is exactly what Ancular does for each guest.
 * Pure CSS (see .orbit in globals.css), so it costs nothing to run.
 *
 * Photos: one birthday shoot by Alexander Mass on Pexels (free to use), cropped
 * square around the same guest and stored in /public/landing/hero.
 */

const PHOTOS = [32333369, 32333364, 32333372, 32333376, 32333365, 32333373, 32333361, 32333377];

export function HeroOrbit() {
  return (
    <div className="orbit" aria-hidden="true">
      <div className="orbit-track">
        {PHOTOS.map((id, i) => (
          <div key={id} className="orbit-item" style={{ ["--a" as string]: `${(360 / PHOTOS.length) * i}deg`, ["--n" as string]: i }}>
            <div className="orbit-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/landing/hero/${id}.webp`} alt="" width={560} height={560} loading="eager" decoding="async" />
              <span className="orbit-found">
                <span className="orbit-chip">You</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="orbit-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/landing/hero/selfie.webp" alt="" width={520} height={520} className="orbit-selfie" />
        <span className="orbit-corners" />
        <span className="orbit-center-label">Your selfie</span>
      </div>
    </div>
  );
}
