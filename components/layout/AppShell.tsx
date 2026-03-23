"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { AppShellAvatar } from "@/components/layout/AppShellAvatar";

type AppShellProps = {
  children: React.ReactNode;
  avatarId?: string | null;
  hasUnreadNotifications?: boolean;
};

/**
 * Mobile app shell — stable viewport, scrollable content, sticky bottom nav.
 * Safe-area aware for notched devices (iPhone X+, Android gestures).
 */
export function AppShell({ children, avatarId = null, hasUnreadNotifications = false }: AppShellProps) {
  return (
    <div
      className="flex min-h-dvh flex-col bg-neutral-950 text-white"
      style={{
        minHeight: "100dvh",
        paddingTop: "var(--safe-area-top)",
        paddingLeft: "var(--safe-area-left)",
        paddingRight: "var(--safe-area-right)",
      }}
    >
      <AppShellAvatar avatarId={avatarId} hasUnreadNotifications={hasUnreadNotifications} />

      {/* Scrollable content area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-auto overscroll-contain">
        {children}
      </div>

      <footer className="flex-shrink-0">
        <BottomNav />
      </footer>
    </div>
  );
}
