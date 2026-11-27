"use client";

import { useEffect, useRef, useState } from "react";

export type Verification = {
  name: string;
  email: string;
  at: string;
};

/** Iconoir "badge-check": a seal with a tick. */
function BadgeCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.521 2.624a2 2 0 0 1 2.958 0l1.02 1.12a2 2 0 0 0 1.572.651l1.514-.07a2 2 0 0 1 2.092 2.09l-.071 1.515a2 2 0 0 0 .651 1.572l1.12 1.02a2 2 0 0 1 0 2.958l-1.12 1.02a2 2 0 0 0-.651 1.572l.07 1.514a2 2 0 0 1-2.09 2.092l-1.515-.071a2 2 0 0 0-1.572.651l-1.02 1.12a2 2 0 0 1-2.958 0l-1.02-1.12a2 2 0 0 0-1.572-.651l-1.514.07a2 2 0 0 1-2.092-2.09l.071-1.515a2 2 0 0 0-.651-1.572l-1.12-1.02a2 2 0 0 1 0-2.958l1.12-1.02a2 2 0 0 0 .651-1.572l-.07-1.514a2 2 0 0 1 2.09-2.092l1.515.071a2 2 0 0 0 1.572-.651l1.02-1.12Z"
        fill="var(--c-blue)"
      />
      <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * "Hosted by <name> [Verified]". Tapping the badge shows the name and email Ancular checked,
 * so a guest can trust the link before signing up or taking a selfie.
 */
export function VerifiedBadge({ v, tone = "ink" }: { v: Verification; tone?: "ink" | "light" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const date = new Date(v.at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <span ref={ref} className={`vb vb-${tone}`}>
      <span className="vb-host">Hosted by {v.name}</span>
      <button
        type="button"
        className="vb-chip"
        aria-expanded={open}
        aria-label={`${v.name} is a verified organiser. Show details`}
        onClick={() => setOpen((o) => !o)}
      >
        <BadgeCheck />
        Verified
      </button>
      {open && (
        <span className="vb-pop" role="dialog" aria-label="Verified organiser">
          <span className="vb-pop-title">
            <BadgeCheck size={20} />
            Verified organiser
          </span>
          <span className="vb-row">
            <span className="vb-k">Name</span>
            <span className="vb-v">{v.name}</span>
          </span>
          <span className="vb-row">
            <span className="vb-k">Email</span>
            <span className="vb-v">{v.email}</span>
          </span>
          <span className="vb-note">
            Ancular checked this organiser&apos;s name and email on {date}. Only photos they upload appear
            here, and you only ever see photos of you.
          </span>
        </span>
      )}
    </span>
  );
}
