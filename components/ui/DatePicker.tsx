import type { InputHTMLAttributes } from "react";

/**
 * Reusable date picker wrapping <input type="date">.
 *
 * Uses [color-scheme:dark] to coerce the browser's native calendar popup
 * into dark mode — works on Chrome, Safari, and modern Firefox without any
 * third-party library.
 *
 * Size variants:
 *   "sm"  — px-3.5 py-2.5 text-[13px]  (default; matches AddActionForm inputs)
 *   "lg"  — px-4    py-3.5 text-[14px] (matches TripForm inputs)
 *
 * Pass any standard <input> prop through; `type` is fixed to "date".
 */

type Size = "sm" | "lg";

type DatePickerProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  size?: Size;
};

const BASE =
  "w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] text-white " +
  "transition-colors focus:border-white/[0.15] focus:outline-none [color-scheme:dark]";

const SIZE_CLS: Record<Size, string> = {
  sm: "px-3.5 py-2.5 text-[13px]",
  lg: "px-4 py-3.5 text-[14px]",
};

export function DatePicker({ size = "sm", className = "", ...props }: DatePickerProps) {
  return (
    <input
      type="date"
      className={`${BASE} ${SIZE_CLS[size]} ${className}`}
      {...props}
    />
  );
}
