"use client";

import { useState } from "react";

/**
 * A photo that shimmers grey until its file arrives, then settles in.
 * Pass src={null} while the link is still being fetched.
 */
export function PhotoImg({
  src,
  alt = "",
  className = "",
  eager = false,
}: {
  src: string | null;
  alt?: string;
  className?: string;
  eager?: boolean;
}) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = src !== null && loadedSrc === src;
  return (
    <span className={`block h-full w-full ${loaded ? "" : "skeleton"}`}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoadedSrc(src)}
          onError={() => setLoadedSrc(src)}
          ref={(el) => {
            if (el?.complete && el.naturalWidth > 0 && loadedSrc !== src) requestAnimationFrame(() => setLoadedSrc(src));
          }}
          data-loaded={loaded}
          className={`photo-in h-full w-full object-cover ${className}`}
        />
      )}
    </span>
  );
}
