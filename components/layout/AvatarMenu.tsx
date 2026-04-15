"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";

type AvatarMenuProps = {
  avatarId: string | null;
  hasUnreadNotifications: boolean;
};

export function AvatarMenu({ avatarId, hasUnreadNotifications }: AvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full transition-opacity active:scale-95 active:opacity-90"
        aria-label="Open menu"
      >
        <UserAvatar avatarId={avatarId} size="medium" />
        {hasUnreadNotifications && (
          <span
            className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-neutral-950"
            aria-hidden="true"
          />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-2xl border border-[#E5E5E5] bg-white py-1 shadow-lg dark:border-white/[0.08] dark:bg-neutral-900 dark:shadow-xl"
          role="menu"
        >
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-[14px] text-[#444444] transition-colors hover:bg-[#F5F5F5] hover:text-[#111111] dark:text-white/80 dark:hover:bg-white/[0.06] dark:hover:text-white"
            role="menuitem"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            Notifications
            {hasUnreadNotifications && (
              <span className="ml-auto h-2 w-2 rounded-full bg-red-500" />
            )}
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-[14px] text-[#444444] transition-colors hover:bg-[#F5F5F5] hover:text-[#111111] dark:text-white/80 dark:hover:bg-white/[0.06] dark:hover:text-white"
            role="menuitem"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Settings
          </Link>
        </div>
      )}
    </div>
  );
}
