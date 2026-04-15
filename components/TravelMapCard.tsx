import Image from "next/image";

export type TravelMapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  active?: boolean;
};

/** Equirectangular plate carrée, matches `public/world-map-light.svg` viewBox 1000×500. */
function latLngToPercent(lat: number, lng: number) {
  return {
    left: ((lng + 180) / 360) * 100,
    top: ((90 - lat) / 180) * 100,
  };
}

type TravelMapCardProps = {
  points: TravelMapPoint[];
  className?: string;
};

export default function TravelMapCard({ points, className = "" }: TravelMapCardProps) {
  const activeIndex = points.findIndex((p) => p.active);
  const primaryActive = activeIndex >= 0 ? points[activeIndex] : null;
  const dotPoints = points.filter((_, i) => i !== activeIndex);

  return (
    <div
      className={`relative mx-auto aspect-[2/1] w-full max-h-[min(52vw,16rem)] overflow-hidden rounded-xl bg-[#F4F7FA] sm:max-h-[min(46vw,18rem)] dark:bg-neutral-900/30 ${className}`.trim()}
    >
      <Image
        src="/world-map-light.svg"
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, 28rem"
        className="pointer-events-none object-cover object-center"
        priority={false}
      />

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {dotPoints.map((point) => {
          const { left, top } = latLngToPercent(point.lat, point.lng);
          return (
            <div
              key={point.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <div className="h-2 w-2 rounded-full bg-sky-500 shadow-sm dark:bg-sky-400" />
            </div>
          );
        })}

        {primaryActive ? (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${latLngToPercent(primaryActive.lat, primaryActive.lng).left}%`,
              top: `${latLngToPercent(primaryActive.lat, primaryActive.lng).top}%`,
            }}
          >
            <div className="relative flex items-center">
              <div className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-sky-500/20 dark:bg-sky-400/25" />
                <div className="relative h-2.5 w-2.5 rounded-full bg-sky-500 ring-2 ring-white dark:bg-sky-400 dark:ring-neutral-900" />
              </div>
              <div className="ml-1.5 whitespace-nowrap rounded-full bg-sky-600 px-2.5 py-1 text-[12px] font-semibold text-white shadow-sm dark:bg-sky-500">
                {primaryActive.name}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
