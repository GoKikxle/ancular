import { ImageResponse } from "next/og";

/** Social cover size used by Open Graph and Twitter large cards. */
export const ogSize = { width: 1200, height: 630 };
export const ogAlt = "Ancular";
export const ogContentType = "image/png";

/** Centered white lettermark on a solid black field. */
export function createOgCover() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
        }}
      >
        {/* Solid LogoMark — lens hole lets the black field show through */}
        <svg
          width="340"
          height="291"
          viewBox="3 0 28 24"
          fill="#ffffff"
        >
          <path d="M10.5 6A6 6 0 0 0 10.5 18Z" />
          <path
            fillRule="evenodd"
            d="M12 2H20A10 10 0 0 1 20 22H12ZM24 12A4.5 4.5 0 1 0 15 12A4.5 4.5 0 1 0 24 12Z"
          />
          <circle cx="19.5" cy="12" r="2" />
        </svg>
      </div>
    ),
    {
      ...ogSize,
    },
  );
}
