/**
 * Landing-page media grid, laid out like swipe.hex's cards: a photo with a
 * two-line caption under it. Sample photos from Pexels (free to use), served
 * from the Pexels CDN. Tiles marked "You" show what a guest's own results feel like.
 */

type Tile = { id: number; w: number; h: number; alt: string; title: string; sub: string; you?: boolean };

const TILES: Tile[] = [
  { id: 29083272, w: 800, h: 1351, alt: "Couple in traditional wedding outfits holding hands", title: "Bride and groom", sub: "Traditional wedding, 11:20am", you: true },
  { id: 6173819, w: 800, h: 533, alt: "Woman dancing at a party", title: "Dance floor", sub: "Birthday party, 10:45pm" },
  { id: 17223872, w: 800, h: 1000, alt: "Bride with her bridesmaids", title: "The bride and her girls", sub: "Wedding, 2:05pm" },
  { id: 7471511, w: 800, h: 533, alt: "Women carrying a ceremonial plate at a family celebration", title: "Mehndi night", sub: "Family celebration" },
  { id: 9301852, w: 800, h: 1000, alt: "Bride in kente cloth and beads", title: "Getting ready", sub: "Ghanaian traditional wedding", you: true },
  { id: 20367616, w: 800, h: 482, alt: "Bridesmaids in matching gele and outfits holding fans", title: "Aso-ebi crew", sub: "Reception, 4:12pm", you: true },
  { id: 8815002, w: 800, h: 534, alt: "Pastor speaking in front of a choir and congregation", title: "Thanksgiving service", sub: "Sunday, 11:00am" },
  { id: 33103894, w: 800, h: 1067, alt: "Couple dancing at an outdoor party with balloons", title: "Garden party", sub: "Saturday, 4:30pm" },
];

const src = (id: number, w: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export function EventGrid({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <ul className="columns-2 gap-2 md:columns-4 md:gap-8">
        {TILES.map((t, i) => (
          <li key={t.id} className="mb-5 break-inside-avoid md:mb-8">
            <div className="media relative" style={{ aspectRatio: `${t.w} / ${t.h}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src(t.id, 800)}
                srcSet={`${src(t.id, 400)} 400w, ${src(t.id, 800)} 800w`}
                sizes="(min-width: 768px) 25vw, 50vw"
                alt={t.alt}
                width={t.w}
                height={t.h}
                loading={i < 4 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
              {t.you && (
                <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold">You</span>
              )}
            </div>
            <p className="t-item mt-2">{t.title}</p>
            <p className="t-item-sub">{t.sub}</p>
          </li>
        ))}
      </ul>
      <p className="t-meta">
        Sample photos from{" "}
        <a href="https://www.pexels.com" className="underline underline-offset-4 hover:text-ink" rel="noreferrer" target="_blank">
          Pexels
        </a>
        .
      </p>
    </div>
  );
}
