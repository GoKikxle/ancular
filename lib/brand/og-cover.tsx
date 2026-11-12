import { ImageResponse } from "next/og";

/** Social cover size used by Open Graph and Twitter large cards. */
export const ogSize = { width: 1200, height: 630 };
export const ogAlt = "Ancular";
export const ogContentType = "image/png";

/**
 * Centered lettermark on a soft purple field built from the pricing-card
 * accent (#b28dff) and its neighbouring stops — not a rainbow mesh.
 */
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
          position: "relative",
          background:
            "linear-gradient(128deg, #8f63e8 0%, #b28dff 48%, #c4a6ff 78%, #a9c4ff 100%)",
        }}
      >
        {/* Soft luminous pool behind the mark */}
        <div
          style={{
            position: "absolute",
            width: 560,
            height: 560,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0) 70%)",
          }}
        />
        {/* Solid LogoMark — lens hole lets the purple field show through */}
        <svg
          width="340"
          height="291"
          viewBox="3 0 28 24"
          fill="#101013"
          style={{ position: "relative" }}
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
