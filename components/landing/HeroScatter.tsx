"use client";

import { useEffect, useRef } from "react";
import { IconDot } from "./PixelIcon";

/**
 * The hero's scattered photos: one birthday party, the same guest in every frame,
 * spread around the headline. Each piece drifts at its own speed as you scroll,
 * so the page opens up like a table of prints being cleared away.
 *
 * Photos: one birthday shoot by Alexander Mass on Pexels (free to use).
 */

type Piece = { id: number; l: number; t: number; w: number; r: string; k: number; hideSm?: boolean };

const PHOTOS: Piece[] = [
  { id: 32333369, l: 3, t: 13, w: 12, r: "4/5", k: 0.35 },
  { id: 32333364, l: 21, t: 5, w: 8, r: "1/1", k: 0.55, hideSm: true },
  { id: 32333372, l: 41, t: 2, w: 7, r: "4/3", k: 0.25 },
  { id: 32333376, l: 64, t: 7, w: 9, r: "1/1", k: 0.6, hideSm: true },
  { id: 32333365, l: 84, t: 13, w: 12, r: "4/5", k: 0.4 },
  { id: 32333373, l: 5, t: 67, w: 9, r: "1/1", k: 0.7 },
  { id: 32333361, l: 23, t: 79, w: 11, r: "4/3", k: 0.5, hideSm: true },
  { id: 32333377, l: 68, t: 74, w: 13, r: "4/3", k: 0.45 },
];

export function HeroScatter() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      el.style.setProperty("--sy", String(Math.min(window.scrollY, 1400)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="hs" aria-hidden="true">
      {PHOTOS.map((p, i) => (
        <div
          key={p.id}
          className={`hs-item ${p.hideSm ? "hs-hide-sm" : ""}`}
          style={{
            left: `${p.l}%`,
            top: `${p.t}%`,
            ["--w" as string]: p.w,
            ["--k" as string]: p.k,
            ["--d" as string]: `${120 + i * 70}ms`,
            aspectRatio: p.r,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/landing/hero/${p.id}.webp`} alt="" loading="eager" decoding="async" />
        </div>
      ))}

      {/* Stickers */}
      <div className="hs-item hs-sticker" style={{ left: "15%", top: "42%", ["--k" as string]: 0.9, ["--d" as string]: "700ms" }}>
        <IconDot name="camera" color="var(--c-purple)" size={72} className="px-dot-float" />
      </div>
      <div className="hs-item hs-sticker hs-hide-sm" style={{ left: "82%", top: "44%", ["--k" as string]: 0.8, ["--d" as string]: "780ms" }}>
        <IconDot name="heart" color="var(--c-yellow)" size={60} className="px-dot-float" />
      </div>
      <div className="hs-item hs-sticker" style={{ left: "87%", top: "67%", ["--k" as string]: 0.3, ["--d" as string]: "860ms" }}>
        <div className="hs-selfie">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/landing/hero/selfie.webp" alt="" />
          <span className="hs-selfie-tag">Your selfie</span>
        </div>
      </div>
      <div className="hs-item hs-sticker hs-hide-sm" style={{ left: "52%", top: "84%", ["--k" as string]: 0.65, ["--d" as string]: "940ms" }}>
        <span className="lp-oval">
          <span>✱</span> One selfie <span>✱</span>
          <br />
          every photo
        </span>
      </div>
    </div>
  );
}
