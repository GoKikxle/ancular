"use client";

import { motion } from "framer-motion";

// Equirectangular projection — viewBox "0 0 1000 500"
// x = (lon + 180) / 360 * 1000
// y = (90  - lat) / 180 * 500

// Simplified continent outlines (clockwise, low fidelity by design)
const LAND: string[] = [
  // North America
  "M 33,69 L 42,56 L 111,56 L 222,47 L 278,19 L 292,19 L 319,119 L 319,128 L 278,181 L 256,206 L 269,222 L 286,228 L 272,225 L 250,208 L 208,189 L 175,161 L 161,147 L 156,114 L 136,100 L 69,86 Z",
  // Greenland
  "M 444,19 L 375,19 L 342,42 L 369,83 L 433,69 L 450,39 Z",
  // South America
  "M 278,222 L 306,217 L 333,222 L 361,244 L 403,264 L 403,283 L 389,311 L 367,328 L 356,342 L 344,356 L 319,403 L 311,403 L 306,389 L 292,361 L 272,264 Z",
  // Europe
  "M 472,150 L 506,150 L 533,147 L 569,136 L 597,147 L 600,136 L 583,125 L 578,94 L 561,83 L 567,69 L 542,56 L 514,78 L 500,108 L 486,131 Z",
  // Africa
  "M 450,208 L 453,189 L 486,147 L 528,147 L 603,147 L 603,167 L 619,217 L 642,217 L 611,283 L 597,319 L 575,347 L 550,347 L 533,300 L 522,236 L 506,236 L 478,236 Z",
  // Asia (Eurasia + Arabia peninsula)
  "M 569,56 L 694,50 L 833,50 L 972,56 L 1000,61 L 1000,111 L 903,131 L 883,156 L 839,183 L 833,194 L 789,247 L 778,244 L 722,228 L 700,189 L 689,183 L 661,189 L 656,214 L 619,217 L 603,189 L 603,167 L 597,150 L 600,136 L 583,125 L 569,69 Z",
  // Australia
  "M 817,311 L 814,347 L 839,344 L 875,356 L 889,356 L 911,367 L 925,319 L 925,311 L 906,300 L 878,283 L 856,292 L 836,300 Z",
];

export type MapMarker = {
  lon: number;
  lat: number;
};

type Props = {
  markers?: MapMarker[];
  fillOpacity?: number;
  markerColor?: string;
};

export function TripsWorldMap({
  markers = [],
  fillOpacity = 0.09,
  markerColor = "#F6C453",
}: Props) {
  return (
    <svg
      viewBox="0 0 1000 500"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
    >
      <defs>
        <filter id="wm-marker-glow" x="-160%" y="-160%" width="420%" height="420%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {LAND.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={`rgba(255,255,255,${fillOpacity})`}
          stroke={`rgba(255,255,255,${Math.max(0, fillOpacity - 0.03)})`}
          strokeWidth="1"
          strokeLinejoin="round"
        />
      ))}

      {markers.map((m, i) => {
        const x = Math.round(((m.lon + 180) / 360) * 1000);
        const y = Math.round(((90 - m.lat) / 180) * 500);
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="5"
            fill={markerColor}
            filter="url(#wm-marker-glow)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.8 + i * 0.1 }}
          />
        );
      })}
    </svg>
  );
}
