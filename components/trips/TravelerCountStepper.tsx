"use client";

import { useState } from "react";

const MIN = 1;
const MAX = 20;

/** Parse leading integer from stored label e.g. "2 travelers", "12 people". */
export function parseTravelerCount(text: string | null | undefined): number {
  if (!text?.trim()) return MIN;
  const m = text.trim().match(/^(\d+)/);
  if (!m) return MIN;
  const n = parseInt(m[1], 10);
  if (Number.isNaN(n)) return MIN;
  return Math.min(MAX, Math.max(MIN, n));
}

export function formatTravelersFieldValue(n: number): string {
  const c = Math.min(MAX, Math.max(MIN, n));
  return c === 1 ? "1 traveler" : `${c} travelers`;
}

type TravelerCountStepperProps = {
  /** Form field name (submitted with create/update actions). */
  name: string;
  /** Create flow — starting count. */
  defaultCount?: number;
  /** Edit flow — existing DB string. */
  initialLabel?: string | null;
};

/**
 * Plus/minus stepper for traveler count. Submits the same string format as before ("1 traveler" / "N travelers").
 */
export function TravelerCountStepper({
  name,
  defaultCount = MIN,
  initialLabel,
}: TravelerCountStepperProps) {
  const [count, setCount] = useState(() =>
    initialLabel !== undefined && initialLabel !== null
      ? parseTravelerCount(initialLabel)
      : defaultCount
  );

  return (
    <>
      <input type="hidden" name={name} value={formatTravelersFieldValue(count)} />
      <div className="flex h-12 w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
        <button
          type="button"
          aria-label="Fewer travelers"
          disabled={count <= MIN}
          onClick={() => setCount((c) => Math.max(MIN, c - 1))}
          className="flex w-[3.25rem] shrink-0 items-center justify-center text-[20px] font-medium leading-none text-white/85 transition-colors hover:bg-white/[0.06] active:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-25"
        >
          −
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center border-x border-white/[0.06] px-2">
          <span className="text-[17px] font-semibold tabular-nums tracking-tight text-white">
            {count}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/35">
            {count === 1 ? "traveler" : "travelers"}
          </span>
        </div>
        <button
          type="button"
          aria-label="More travelers"
          disabled={count >= MAX}
          onClick={() => setCount((c) => Math.min(MAX, c + 1))}
          className="flex w-[3.25rem] shrink-0 items-center justify-center text-[20px] font-medium leading-none text-white/85 transition-colors hover:bg-white/[0.06] active:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-25"
        >
          +
        </button>
      </div>
    </>
  );
}
