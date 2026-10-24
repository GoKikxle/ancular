/**
 * Landing-page media grid, laid out like swipe.hex's cards: a media tile with a
 * two-line caption under it. The tiles are drawn, not photographed: abstract guests
 * in grey, and in a few tiles one guest in black with a ring, the person a selfie found.
 */

type Person = { x: number; s: number; you?: boolean };
type Tile = { ratio: string; people: Person[]; title: string; sub: string };

const TILES: Tile[] = [
  { ratio: "4 / 5", people: [{ x: 30, s: 1 }, { x: 70, s: 1.05, you: true }], title: "Bride's entrance", sub: "Reception, 4:12pm" },
  { ratio: "1 / 1", people: [{ x: 20, s: 0.8 }, { x: 50, s: 0.85 }, { x: 80, s: 0.8 }], title: "Family photo", sub: "After the service" },
  { ratio: "3 / 4", people: [{ x: 50, s: 1.35, you: true }], title: "Portrait", sub: "Photo booth" },
  { ratio: "4 / 3", people: [{ x: 25, s: 0.75 }, { x: 50, s: 0.8, you: true }, { x: 75, s: 0.75 }], title: "Spraying the couple", sub: "Dance floor, 7:40pm" },
  { ratio: "1 / 1", people: [{ x: 38, s: 0.95 }, { x: 64, s: 1 }], title: "Aso-ebi friends", sub: "Reception, 5:03pm" },
  { ratio: "4 / 5", people: [{ x: 50, s: 1.15 }], title: "The groom", sub: "Church, 11:20am" },
  { ratio: "3 / 4", people: [{ x: 32, s: 0.9 }, { x: 68, s: 0.95, you: true }], title: "Cutting the cake", sub: "Reception, 6:15pm" },
  { ratio: "4 / 3", people: [{ x: 18, s: 0.7 }, { x: 40, s: 0.72 }, { x: 62, s: 0.7 }, { x: 84, s: 0.72 }], title: "Choir", sub: "Thanksgiving service" },
];

function Guest({ x, s, you }: Person) {
  const head = 9 * s;
  const cy = 100 - 37 * s;
  const shoulder = 19 * s;
  const top = cy + head + 4 * s;
  const fill = you ? "#000" : "rgba(0,0,0,0.11)";
  return (
    <g>
      <circle cx={x} cy={cy} r={head} fill={fill} />
      <path d={`M ${x - shoulder} 100 C ${x - shoulder} ${top}, ${x + shoulder} ${top}, ${x + shoulder} 100 Z`} fill={fill} />
      {you && <circle cx={x} cy={cy} r={head + 5} fill="none" stroke="#000" strokeWidth={1} />}
    </g>
  );
}

export function CrowdGrid({ className = "" }: { className?: string }) {
  return (
    <ul className={`columns-2 gap-2 md:columns-4 md:gap-8 ${className}`} aria-hidden="true">
      {TILES.map((t) => (
        <li key={t.title} className="mb-5 break-inside-avoid md:mb-8">
          <div className="media relative" style={{ aspectRatio: t.ratio }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" className="absolute inset-0 h-full w-full">
              {t.people.map((p, i) => (
                <Guest key={i} {...p} />
              ))}
            </svg>
            {t.people.some((p) => p.you) && (
              <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold">You</span>
            )}
          </div>
          <p className="t-item mt-2">{t.title}</p>
          <p className="t-item-sub">{t.sub}</p>
        </li>
      ))}
    </ul>
  );
}
