"use client";

import { useEffect, useRef } from "react";

/**
 * How it works, after telescope.fyi: one paragraph stays pinned on the left and
 * inks in word by word as you scroll, while the three steps scroll past on the
 * right, each one plain image with a short title and line.
 */

const BEFORE = "Ancular is private photo sharing for events. The host uploads the day's photos and shares one invite link. Each guest takes";
const RING = "one selfie";
const AFTER = "and gets every photo they're in, ready to save or send.";

function QrArt() {
  const N = 21;
  const finder = (x: number, y: number) => {
    for (const [fx, fy] of [[0, 0], [N - 7, 0], [0, N - 7]]) {
      const dx = x - fx;
      const dy = y - fy;
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) {
        const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        return ring === 3 || ring <= 1 ? 1 : 0;
      }
      if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) return 0;
    }
    return null;
  };
  const cells: number[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) cells.push(finder(x, y) ?? ((x * 7 + y * 13 + x * y) % 5 < 2 ? 1 : 0));
  return (
    <div className="hiw-qr">
      <svg viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" aria-hidden="true">
        {cells.map((c, i) => (c ? <rect key={i} x={i % N} y={Math.floor(i / N)} width="1" height="1" /> : null))}
      </svg>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Upload the photos",
    line: "Host · faces are found as they go up",
    img: "/landing/uc/conferences-1400.webp",
    alt: "Conference attendees applauding a speaker",
  },
  { n: "02", title: "Share one link", line: "Host · only people with it can join", img: null, alt: "" },
  {
    n: "03",
    title: "Take one selfie",
    line: "Guest · only your photos, no app",
    img: "/landing/hero/selfie.webp",
    alt: "A smiling guest at a birthday party",
  },
];

export function HowItWorks() {
  const section = useRef<HTMLDivElement>(null);
  const para = useRef<HTMLParagraphElement>(null);

  const before = BEFORE.split(" ");
  const ring = RING.split(" ");
  const after = AFTER.split(" ");
  const n = before.length + ring.length + after.length;
  const word = (w: string, i: number) => (
    <span key={i} className="hiw-w" style={{ ["--i" as string]: i / n }}>
      {w}{" "}
    </span>
  );

  useEffect(() => {
    const s = section.current;
    const p = para.current;
    if (!s || !p || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      p?.style.setProperty("--p", "2");
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = s.getBoundingClientRect();
      const vh = window.innerHeight;
      const v = (vh * 0.55 - r.top) / Math.max(1, r.height - vh * 0.5);
      p.style.setProperty("--p", String(Math.min(1, Math.max(0, v))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={section} className="hiw">
      <div className="hiw-left">
        <p ref={para} className="hiw-para" style={{ ["--n" as string]: n }}>
          {before.map((w, i) => word(w, i))}
          <span className="lp-ring">
            {ring.map((w, i) => (
              <span key={i} className="hiw-w" style={{ ["--i" as string]: (before.length + i) / n }}>
                {w}
                {i < ring.length - 1 ? " " : ""}
              </span>
            ))}
          </span>{" "}
          {after.map((w, i) => word(w, before.length + ring.length + i))}
        </p>
      </div>

      <ol className="hiw-steps">
        {STEPS.map((s) => (
          <li key={s.n} className="hiw-step">
            <div className="hiw-media">
              {s.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.img} alt={s.alt} loading="lazy" decoding="async" />
              ) : (
                <QrArt />
              )}
            </div>
            <h3 className="hiw-title">{s.title}</h3>
            <p className="hiw-line">
              {s.n} · {s.line}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
