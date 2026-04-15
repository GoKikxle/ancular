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
  name: string;
  defaultCount?: number;
  initialLabel?: string | null;
};

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
      <div className="flex h-12 w-full overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-[0_1px_0_rgba(0,0,0,0.02)] dark:border-white/[0.1] dark:bg-white/[0.05]">
        <button
          type="button"
          aria-label="Fewer travelers"
          disabled={count <= MIN}
          onClick={() => setCount((c) => Math.max(MIN, c - 1))}
          className="flex w-[3.25rem] shrink-0 items-center justify-center text-[20px] font-medium leading-none text-[#111111] transition-colors hover:bg-[#F5F5F5] active:bg-[#EBEBEB] disabled:cursor-not-allowed disabled:opacity-30 dark:text-white dark:hover:bg-white/[0.06] dark:active:bg-white/[0.08]"
        >
          −
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center border-x border-[#EBEBEB] px-2 dark:border-white/[0.08]">
          <span className="text-[17px] font-semibold tabular-nums tracking-tight text-[#111111] dark:text-white">
            {count}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9A9A9A] dark:text-white/40">
            {count === 1 ? "traveler" : "travelers"}
          </span>
        </div>
        <button
          type="button"
          aria-label="More travelers"
          disabled={count >= MAX}
          onClick={() => setCount((c) => Math.min(MAX, c + 1))}
          className="flex w-[3.25rem] shrink-0 items-center justify-center text-[20px] font-medium leading-none text-[#111111] transition-colors hover:bg-[#F5F5F5] active:bg-[#EBEBEB] disabled:cursor-not-allowed disabled:opacity-30 dark:text-white dark:hover:bg-white/[0.06] dark:active:bg-white/[0.08]"
        >
          +
        </button>
      </div>
    </>
  );
}
