"use client";

import { usePathname } from "next/navigation";
import { AvatarMenu } from "./AvatarMenu";

const HIDE_AVATAR_PATHS = ["/login", "/signup", "/auth"];

function isAvatarVisible(pathname: string): boolean {
  return !HIDE_AVATAR_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

type AppShellAvatarProps = {
  avatarId: string | null;
  hasUnreadNotifications: boolean;
};

export function AppShellAvatar({ avatarId, hasUnreadNotifications }: AppShellAvatarProps) {
  const pathname = usePathname();

  if (!isAvatarVisible(pathname)) return null;

  return (
    <div className="absolute right-5 top-[var(--safe-area-top)] z-40 pt-2">
      <AvatarMenu avatarId={avatarId} hasUnreadNotifications={hasUnreadNotifications} />
    </div>
  );
}

