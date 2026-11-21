/**
 * Under the hero: a calm row of one party's photos, the same guest in each,
 * with her selfie in the middle. Photos by Alexander Mass on Pexels (free to use).
 */
const LEFT = [32333369, 32333364];
const RIGHT = [32333376, 32333365];

export function HeroRow() {
  return (
    <div className="hr reveal-up" style={{ animationDelay: "320ms" }} aria-hidden="true">
      {LEFT.map((id) => (
        <div key={id} className="hr-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/landing/hero/${id}.webp`} alt="" />
        </div>
      ))}
      <div className="hr-selfie">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/landing/hero/selfie.webp" alt="" />
        <span className="hr-tag">Your selfie</span>
      </div>
      {RIGHT.map((id) => (
        <div key={id} className="hr-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/landing/hero/${id}.webp`} alt="" />
        </div>
      ))}
    </div>
  );
}
