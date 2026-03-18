"use client";

import { BottomNav } from "@/components/layout/BottomNav";

type AppShellProps = {
  children: React.ReactNode;
};

/**
 * Mobile app shell — stable viewport, scrollable content, sticky bottom nav.
 * Safe-area aware for notched devices (iPhone X+, Android gestures).
 */
export function AppShell({ children }: AppShellProps) {
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
      {/* Scrollable content area — extra bottom pad so content clears the nav */}
      <div className="flex min-h-0 flex-1 flex-col overflow-auto overscroll-contain">
        {children}
      </div>

      {/* Sticky bottom nav */}
      <footer className="flex-shrink-0">
        <BottomNav />
      </footer>
    </div>
  );
}
