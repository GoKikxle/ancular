"use client";

import { BottomNav } from "@/components/layout/BottomNav";

type AppShellProps = {
  children: React.ReactNode;
};

/**
 * Mobile app shell — stable viewport, scrollable content, sticky bottom nav.
 * Safe-area aware for notched devices.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div
      className="flex min-h-dvh flex-col bg-neutral-950 text-white"
      style={{
        minHeight: "100dvh",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Scrollable content area — pages render their own <main> if needed */}
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        {children}
      </div>

      {/* Sticky bottom nav */}
      <footer className="flex-shrink-0">
        <BottomNav />
      </footer>
    </div>
  );
}
