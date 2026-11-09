/**
 * The hero picture: one selfie in the middle, the event's photos circling it.
 * One by one a photo lights up with the "found" ring: that's a photo you're in.
 * Pure CSS (see .orbit in globals.css), so it costs nothing to load.
 */

const PHOTOS = [
  { file: "wedding", alt: "Wedding guests dancing" },
  { file: "festival", alt: "Festival crowd at night" },
  { file: "conference", alt: "Conference audience" },
  { file: "rave", alt: "Friends at a rave" },
  { file: "graduation", alt: "Graduates celebrating" },
  { file: "church", alt: "Church service" },
  { file: "travel", alt: "Friends on a trip" },
  { file: "tech", alt: "Tech meetup" },
];

export function HeroOrbit() {
  return (
    <div className="orbit" aria-hidden="true">
      <div className="orbit-track">
        {PHOTOS.map((p, i) => (
          <div key={p.file} className="orbit-item" style={{ ["--a" as string]: `${(360 / PHOTOS.length) * i}deg`, ["--n" as string]: i }}>
            <div className="orbit-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/landing/${p.file}-600.webp`} alt="" loading="eager" decoding="async" />
              <span className="orbit-found">
                <span className="orbit-chip">You</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="orbit-center">
        <span className="orbit-corners" />
        <svg viewBox="0 0 48 48" className="h-auto w-[clamp(30px,5.2vw,52px)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="24" cy="18" r="8" />
          <path d="M9 41c2.6-7.6 8.4-11 15-11s12.4 3.4 15 11" />
        </svg>
        <span className="orbit-center-label">One selfie</span>
      </div>
    </div>
  );
}
