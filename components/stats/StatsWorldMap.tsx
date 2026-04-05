"use client";

import { motion } from "framer-motion";

// Equirectangular projection — viewBox "0 0 1000 500"
// x = (lng + 180) / 360 * 1000
// y = (90  - lat) / 180 * 500

const LAND: { id: string; d: string }[] = [
  {
    id: "na",
    // North America: Alaska → Arctic Canada → Labrador → East Coast → Florida → Mexico → Central Am → Pacific Coast
    d: "M 55,95 L 38,80 L 42,65 L 62,56 L 88,50 L 120,46 L 155,42 L 195,38 L 228,35 L 262,28 L 280,22 L 298,22 L 315,32 L 320,50 L 322,68 L 318,90 L 322,118 L 318,135 L 308,152 L 292,170 L 272,188 L 260,202 L 264,215 L 275,225 L 268,222 L 250,210 L 228,198 L 205,185 L 180,168 L 162,152 L 155,132 L 148,110 L 134,96 L 108,86 L 82,82 L 60,85 Z",
  },
  {
    id: "greenland",
    d: "M 373,74 L 358,55 L 362,34 L 376,22 L 400,18 L 424,18 L 445,26 L 453,40 L 446,54 L 430,60 L 406,60 L 382,56 Z",
  },
  {
    id: "sa",
    // South America
    d: "M 268,222 L 282,215 L 304,214 L 325,220 L 345,232 L 362,248 L 376,265 L 386,284 L 393,304 L 391,328 L 380,348 L 364,366 L 350,382 L 336,400 L 322,415 L 314,412 L 303,398 L 292,374 L 280,345 L 271,315 L 267,285 L 266,255 Z",
  },
  {
    id: "europe",
    // Western Europe: Iberia → France → Benelux → Germany → Poland → Baltics → Scandinavia → Norway coast → UK coast (simplified)
    d: "M 478,158 L 476,142 L 474,126 L 482,114 L 490,108 L 486,100 L 494,94 L 505,90 L 518,88 L 532,87 L 546,85 L 558,82 L 568,76 L 574,66 L 568,60 L 554,62 L 540,65 L 526,66 L 514,68 L 525,72 L 538,70 L 550,68 L 564,66 L 572,75 L 568,84 L 558,88 L 548,92 L 558,98 L 572,106 L 582,118 L 590,130 L 592,142 L 582,152 L 566,158 L 546,160 L 526,158 L 506,158 Z",
  },
  {
    id: "uk",
    d: "M 482,100 L 490,93 L 498,92 L 502,99 L 496,108 L 484,110 Z",
  },
  {
    id: "africa",
    d: "M 452,198 L 460,178 L 472,162 L 488,150 L 510,146 L 533,146 L 554,150 L 573,158 L 590,170 L 603,184 L 610,202 L 616,222 L 619,242 L 619,262 L 613,282 L 600,302 L 585,318 L 568,330 L 550,340 L 532,342 L 514,334 L 500,318 L 488,298 L 478,274 L 469,248 L 460,222 Z",
  },
  {
    id: "asia",
    // Eurasia from Anatolia/Turkey east to Pacific — does not re-trace Europe
    d: "M 568,76 L 590,68 L 614,62 L 640,56 L 668,50 L 698,46 L 730,43 L 762,41 L 794,41 L 824,44 L 852,47 L 880,51 L 906,55 L 930,59 L 954,63 L 976,67 L 1000,70 L 1000,100 L 997,120 L 988,135 L 970,143 L 950,146 L 930,143 L 910,139 L 892,139 L 874,143 L 856,149 L 838,156 L 820,165 L 804,173 L 786,181 L 768,188 L 750,192 L 732,192 L 714,188 L 697,182 L 682,174 L 668,170 L 654,171 L 641,177 L 629,185 L 620,196 L 616,210 L 613,222 L 610,202 L 603,184 L 590,170 L 573,158 L 554,150 L 533,146 L 510,146 L 488,150 L 472,162 L 460,178 L 452,198 L 450,180 L 458,163 L 470,150 L 482,140 L 492,130 L 500,120 L 506,110 L 514,102 L 524,94 L 538,90 L 550,88 L 562,85 L 568,76 Z",
  },
  {
    id: "india",
    d: "M 668,170 L 682,174 L 696,185 L 706,199 L 710,216 L 706,232 L 696,244 L 680,250 L 664,246 L 652,235 L 648,218 L 652,202 L 660,188 Z",
  },
  {
    id: "sea",
    // Indochina peninsula
    d: "M 750,192 L 764,198 L 776,212 L 782,228 L 780,244 L 769,255 L 753,258 L 739,251 L 731,239 L 731,224 L 737,210 Z",
  },
  {
    id: "japan",
    d: "M 882,116 L 891,110 L 901,113 L 903,123 L 894,129 L 882,125 Z",
  },
  {
    id: "indonesia",
    // Sumatra → Java → Borneo simplified as one band
    d: "M 792,248 L 820,244 L 848,242 L 874,247 L 886,258 L 878,268 L 856,270 L 828,268 L 800,263 L 785,254 Z",
  },
  {
    id: "australia",
    d: "M 820,296 L 836,280 L 856,274 L 878,274 L 900,280 L 918,295 L 928,313 L 931,331 L 925,349 L 911,360 L 892,362 L 872,355 L 853,342 L 836,324 L 820,308 Z",
  },
  {
    id: "nz",
    d: "M 960,345 L 967,337 L 975,339 L 976,349 L 968,358 L 959,354 Z",
  },
];

export type MapPoint = {
  name: string;
  lat: number;
  lng: number;
};

type Props = {
  points?: MapPoint[];
  className?: string;
};

function toXY(lat: number, lng: number) {
  return {
    x: Math.round(((lng + 180) / 360) * 1000),
    y: Math.round(((90 - lat) / 180) * 500),
  };
}

export function StatsWorldMap({ points = [], className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 1000 500"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <filter id="swm-glow" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {LAND.map(({ id, d }) => (
        <path
          key={id}
          d={d}
          fill="#1A1A1E"
          stroke="rgba(255,255,255,0.055)"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      ))}

      {points.map((p, i) => {
        const { x, y } = toXY(p.lat, p.lng);
        return (
          <motion.circle
            key={`${p.name}-${i}`}
            cx={x}
            cy={y}
            r="5"
            fill="#FFB800"
            filter="url(#swm-glow)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.92, scale: 1 }}
            transition={{
              duration: 0.45,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.9 + i * 0.1,
            }}
          />
        );
      })}
    </svg>
  );
}
