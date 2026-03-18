"use client";

import Image from "next/image";
import { getAvatarById } from "@/lib/avatars";

type UserAvatarProps = {
  avatarId: string | null;
  size?: "small" | "medium" | "large";
  className?: string;
};

const SIZE_MAP = {
  small: 32,
  medium: 48,
  large: 96,
};

export function UserAvatar({
  avatarId,
  size = "medium",
  className = "",
}: UserAvatarProps) {
  const { src, alt } = getAvatarById(avatarId);
  const pixelSize = SIZE_MAP[size];

  return (
    <div
      className={`relative overflow-hidden rounded-full ring-1 ring-white/[0.08] ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <Image
        src={src}
        alt={alt}
        width={pixelSize}
        height={pixelSize}
        className="object-cover"
      />
    </div>
  );
}
