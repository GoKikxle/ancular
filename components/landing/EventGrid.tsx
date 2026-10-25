/**
 * Landing-page media grid, laid out like swipe.hex's cards: a photo with a
 * two-line caption. Each tile is a kind of event too big for a WhatsApp group,
 * which is where Ancular earns its place. Photos from Pexels (free to use, no
 * credit required), stored in /public/landing at 600px and 1200px wide.
 */

type Tile = { file: string; w: number; h: number; alt: string; title: string; sub: string };

// Order fills four columns top to bottom, so each column pairs a wide and a tall photo.
const TILES: Tile[] = [
  { file: "festival", w: 1200, h: 800, alt: "Crowd in front of a festival stage with fireworks", title: "Festivals", sub: "Find yourself in a crowd of thousands" },
  { file: "wedding", w: 1200, h: 1500, alt: "Couple dancing at night, surrounded by guests holding up phone lights", title: "Weddings", sub: "Hundreds of guests, thousands of photos" },
  { file: "conference", w: 1200, h: 1499, alt: "Packed conference audience", title: "Conferences", sub: "Every speaker, every attendee" },
  { file: "graduation", w: 1200, h: 800, alt: "Graduates in caps and gowns posing together", title: "Graduations", sub: "Every graduate, every family" },
  { file: "travel", w: 1200, h: 675, alt: "Friends posing for a photo on a trip", title: "Travel groups", sub: "One album for the whole trip" },
  { file: "rave", w: 1200, h: 1499, alt: "Friends at the front of a rave, lit in neon", title: "Raves and parties", sub: "Shot all night, found by morning" },
  { file: "church", w: 1200, h: 1499, alt: "Church congregation worshipping with hands raised", title: "Church services", sub: "Every Sunday, every member" },
  { file: "tech", w: 1200, h: 800, alt: "People at tables watching a presentation at a meetup", title: "Tech gatherings", sub: "Meetups, hackathons and summits" },
];

export function EventGrid({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <ul className="columns-2 gap-2 md:columns-4 md:gap-8">
        {TILES.map((t, i) => (
          <li key={t.file} className="mb-5 break-inside-avoid md:mb-8">
            <div className="media" style={{ aspectRatio: `${t.w} / ${t.h}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/landing/${t.file}-1200.webp`}
                srcSet={`/landing/${t.file}-600.webp 600w, /landing/${t.file}-1200.webp 1200w`}
                sizes="(min-width: 768px) 25vw, 50vw"
                alt={t.alt}
                width={t.w}
                height={t.h}
                loading={i < 4 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="t-item mt-2">{t.title}</p>
            <p className="t-item-sub">{t.sub}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
