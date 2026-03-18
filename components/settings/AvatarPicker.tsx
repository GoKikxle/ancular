"use client";

import Image from "next/image";
import { AVATAR_OPTIONS } from "@/lib/avatars";

type AvatarPickerProps = {
  selectedId: string | null;
  onSelect: (avatarId: string) => void;
};

export function AvatarPicker({ selectedId, onSelect }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {AVATAR_OPTIONS.map((avatar) => {
        const isSelected = selectedId === avatar.id;
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            className={`relative flex aspect-square items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
              isSelected
                ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-950"
                : "opacity-80 hover:opacity-100"
            }`}
            aria-pressed={isSelected}
            aria-label={avatar.alt}
          >
            <Image
              src={avatar.src}
              alt={avatar.alt}
              width={64}
              height={64}
              className="h-full w-full rounded-full object-cover"
            />
          </button>
        );
      })}
    </div>
  );
}
