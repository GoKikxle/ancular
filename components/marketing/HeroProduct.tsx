/**
 * The product picture: a host's event page with a guest's phone in front of it.
 * Built in HTML so it stays sharp; the numbers are illustrative.
 * Photos from Pexels (free to use).
 */
const GRID = [
  "/landing/v3/38446275.webp",
  "/landing/uc/festivals-600.webp",
  "/landing/v3/35755225.webp",
  "/landing/uc/graduations-600.webp",
  "/landing/v3/41134458.webp",
  "/landing/uc/tech-600.webp",
  "/landing/v3/8761637.webp",
  "/landing/uc/raves-600.webp",
  "/landing/v3/30215324.webp",
  "/landing/uc/travel-600.webp",
];
const MINE = [31236825, 31236832, 31236836, 31236839, 31236864, 31236829];

export function HeroProduct() {
  return (
    <div className="hp" aria-hidden="true">
      <div className="hp-app">
        <div className="hp-bar">
          <div className="hp-crumbs">
            <span className="hp-muted">Events</span>
            <span className="hp-muted">/</span>
            <span>Annual Leadership Summit</span>
            <span className="hp-pill">Live</span>
          </div>
          <div className="hp-actions">
            <span className="hp-btn hp-btn-quiet">Guests</span>
            <span className="hp-btn">Share invite</span>
          </div>
        </div>

        <div className="hp-stats">
          {[
            ["Photos", "4,812"],
            ["Guests joined", "1,240"],
            ["Found their photos", "1,118"],
            ["Face data deletes", "In 30 days"],
          ].map(([k, v]) => (
            <div key={k} className="hp-stat">
              <span className="hp-k">{k}</span>
              <span className="hp-v">{v}</span>
            </div>
          ))}
        </div>

        <div className="hp-grid">
          {GRID.map((src, i) => (
            <span key={i} className="hp-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="eager" />
            </span>
          ))}
        </div>
      </div>

      <div className="hp-phone">
        <div className="hp-phone-head">
          <span className="hp-phone-title">Your photos</span>
          <span className="hp-phone-sub">6 found · only you can see these</span>
        </div>
        <div className="hp-phone-grid">
          {MINE.map((id, i) => (
            <span key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/landing/v3/${id}.webp`} alt="" loading="eager" />
            </span>
          ))}
        </div>
        <span className="hp-phone-btn">Save all</span>
      </div>
    </div>
  );
}
