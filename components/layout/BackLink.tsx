"use client";

import { useRouter } from "next/navigation";

/**
 * Goes back to the page you came from. If you arrived from outside Ancular
 * (a WhatsApp link, a QR code), there's nothing to go back to, so it takes
 * you to `fallback` instead.
 */
export function BackLink({
  fallback,
  label = "Back",
}: {
  fallback: string;
  label?: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="back-link"
      onClick={() => {
        const cameFromHere =
          typeof document !== "undefined" &&
          document.referrer &&
          new URL(document.referrer).origin === window.location.origin &&
          window.history.length > 1;
        if (cameFromHere) router.back();
        else router.push(fallback);
      }}
    >
      <svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 8H3M7 4L3 8l4 4" />
      </svg>
      {label}
    </button>
  );
}
