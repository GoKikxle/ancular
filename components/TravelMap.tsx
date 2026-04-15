"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { screenEyebrowLight } from "@/lib/screen-styles";
import { travelMapGeography } from "@/lib/travel-map-geography";

const MAP_W = 1000;
const MAP_H = 480;

const geoStyle = {
  default: {
    fill: "#DDE4EC",
    stroke: "rgba(14, 165, 233, 0.14)",
    strokeWidth: 0.35,
    outline: "none",
  },
  hover: {
    fill: "#D4DCE6",
    stroke: "rgba(14, 165, 233, 0.18)",
    strokeWidth: 0.35,
    outline: "none",
  },
  pressed: {
    fill: "#D4DCE6",
    outline: "none",
  },
} as const;

export type TravelMapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  active?: boolean;
};

export type TravelMapHeading = {
  eyebrow: string;
  title: string;
  titleId?: string;
};

type TravelMapProps = {
  points: TravelMapPoint[];
  heading?: TravelMapHeading;
  className?: string;
};

export default function TravelMap({ points, heading, className = "" }: TravelMapProps) {
  const titleId = heading?.titleId ?? "travel-map-heading";
  const activeIndex = points.findIndex((p) => p.active);
  const primaryActive = activeIndex >= 0 ? points[activeIndex] : null;
  const dotPoints = points.filter((_, i) => i !== activeIndex);

  const body = (
    <>
      {heading ? (
        <header className="mb-4">
          <p className={screenEyebrowLight}>{heading.eyebrow}</p>
          <h2
            id={titleId}
            className="mt-1 text-[18px] font-bold tracking-[-0.02em] text-[#111111] dark:text-white"
          >
            {heading.title}
          </h2>
        </header>
      ) : null}

      <div className="rounded-2xl border border-[#EBEBEB] bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:border-white/[0.1] dark:bg-white/[0.05] dark:shadow-none sm:p-4">
        <div className="relative mx-auto aspect-[1000/480] w-full max-h-[min(52vw,16rem)] overflow-hidden rounded-xl bg-[#F4F7FA] sm:max-h-[min(46vw,18rem)] dark:bg-neutral-900/30">
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{
              scale: 168,
              center: [0, 4] as [number, number],
            }}
            width={MAP_W}
            height={MAP_H}
            className="block h-full w-full max-h-full"
          >
            <rect x={0} y={0} width={MAP_W} height={MAP_H} fill="#F4F7FA" className="dark:fill-neutral-900/40" />
            <Geographies geography={travelMapGeography}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography key={geo.rsmKey} geography={geo} style={geoStyle} />
                ))
              }
            </Geographies>

            {dotPoints.map((point) => (
              <Marker key={point.id} coordinates={[point.lng, point.lat]}>
                <circle r={3} fill="#0ea5e9" className="dark:fill-sky-400" />
              </Marker>
            ))}

            {primaryActive ? (
              <Marker coordinates={[primaryActive.lng, primaryActive.lat]}>
                <g>
                  <circle r={11} className="fill-sky-500/18 dark:fill-sky-400/20" />
                  <circle
                    r={4}
                    className="fill-sky-500 stroke-white dark:fill-sky-400 dark:stroke-neutral-900"
                    strokeWidth={2.5}
                  />
                  <foreignObject x={10} y={-18} width={200} height={40} style={{ overflow: "visible" }}>
                    <div className="inline-flex rounded-full bg-sky-600 px-2.5 py-1 text-[12px] font-semibold text-white shadow-sm dark:bg-sky-500">
                      {primaryActive.name}
                    </div>
                  </foreignObject>
                </g>
              </Marker>
            ) : null}
          </ComposableMap>
        </div>
      </div>
    </>
  );

  if (heading) {
    return (
      <section className={className} aria-labelledby={titleId}>
        {body}
      </section>
    );
  }

  return <div className={className}>{body}</div>;
}
