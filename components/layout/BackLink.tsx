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
      <NavArrowLeft />
      {label}
    </button>
  );
}

/** Iconoir "nav-arrow-left". */
export function NavArrowLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 6L9 12L15 18" />
    </svg>
  );
}
