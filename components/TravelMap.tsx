"use client";

/**
 * Swap this `d` for a real country/region outline (single path or compose multiple <path>s below).
 * viewBox stays `0 0 500 500` unless you change it—then update marker % positions accordingly.
 */
const PLACEHOLDER_MAP_PATH_D =
  "M80 200 L150 180 L200 220 L260 210 L320 240 L360 220 L400 260 L380 300 L320 320 L260 300 L200 320 L140 300 L100 260 Z";

type MapPoint = {
  id: string;
  name: string;
  x: number;
  y: number;
  active?: boolean;
};

type TravelMapProps = {
  points: MapPoint[];
  /** Optional class on the outer card (e.g. spacing) */
  className?: string;
};

export default function TravelMap({ points, className = "" }: TravelMapProps) {
  return (
    <div
      className={`rounded-2xl border border-[#EBEBEB] bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:border-white/[0.1] dark:bg-white/[0.05] dark:shadow-none sm:p-4 ${className}`.trim()}
    >
      <div className="relative aspect-square w-full max-h-[min(72vw,22rem)] overflow-hidden rounded-xl sm:max-h-[min(64vw,24rem)] mx-auto">
        <svg viewBox="0 0 500 500" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          {/* Replace PLACEHOLDER_MAP_PATH_D or add more <path />s for a real map */}
          <path
            d={PLACEHOLDER_MAP_PATH_D}
            className="fill-[#E2EAF2] stroke-sky-500/20 dark:fill-white/10 dark:stroke-sky-400/25"
            strokeWidth="1.2"
          />
        </svg>

        {points.map((point) => (
          <div
            key={point.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            {point.active ? (
              <ActiveMarker label={point.name} />
            ) : (
              <InactiveMarker />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InactiveMarker() {
  return <div className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-sm dark:bg-sky-400" />;
}

function ActiveMarker({ label }: { label: string }) {
  return (
    <div className="relative">
      <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/15 dark:bg-sky-400/20" />
      <div className="relative h-3 w-3 rounded-full bg-sky-500 ring-2 ring-white dark:bg-sky-400 dark:ring-neutral-900" />
      <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 whitespace-nowrap rounded-xl bg-sky-600 px-3 py-1.5 text-[13px] font-semibold text-white shadow-md dark:bg-sky-500">
        {label}
      </div>
    </div>
  );
}
