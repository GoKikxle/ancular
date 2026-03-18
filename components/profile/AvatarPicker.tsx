"use client";

import Image from "next/image";
import { AVATAR_IDS, getAvatarUrl } from "@/lib/avatars";

type AvatarPickerProps = {
  selectedId: string | null;
  onSelect: (avatarId: string) => void;
};

export function AvatarPicker({ selectedId, onSelect }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {AVATAR_IDS.map((id) => {
        const isSelected = selectedId === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`relative flex aspect-square items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
              isSelected
                ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-950"
                : "opacity-80 hover:opacity-100"
            }`}
            aria-pressed={isSelected}
            aria-label={`Select avatar ${id}`}
          >
            <Image
              src={getAvatarUrl(id)}
              alt=""
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
