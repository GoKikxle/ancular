"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  icon: React.ReactNode;
  matchPaths?: string[]; // additional paths that count as "active" for this tab
};

const TABS: Tab[] = [
  {
    href: "/",
    label: "Home",
    matchPaths: ["/", "/trips", "/trips/new"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    href: "/documents",
    label: "Vault",
    matchPaths: ["/documents"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        <path d="M12 11v6" />
        <path d="M9 14h6" />
      </svg>
    ),
  },
  {
    href: "/stats",
    label: "My Stats",
    matchPaths: ["/stats"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    matchPaths: ["/settings"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

function isTabActive(pathname: string, tab: Tab): boolean {
  if (pathname === tab.href) return true;
  for (const p of tab.matchPaths ?? []) {
    if (p === pathname) return true;
    if (p !== "/" && pathname.startsWith(p + "/")) return true;
  }
  if (tab.href === "/" && pathname.startsWith("/trips/")) return true; // trip detail = Home section
  return false;
}

/**
 * Persistent bottom tab navigation for the mobile app shell.
 * Safe-area aware, touch-friendly, premium iOS/Android-style hierarchy.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex items-center justify-around border-t border-white/[0.08] bg-neutral-950 px-1 pt-3 backdrop-blur-xl"
      style={{ paddingBottom: "max(12px, var(--safe-area-bottom))" }}
      role="navigation"
      aria-label="Main navigation"
    >
      {TABS.map((tab) => {
        const active = isTabActive(pathname, tab);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1.5 px-2 py-2.5 transition-all duration-200 active:scale-95 ${
              active ? "opacity-100" : "opacity-70"
            }`}
          >
            {/* Icon container — active gets subtle pill background */}
            <span
              className={`flex items-center justify-center rounded-xl transition-all duration-200 ${
                active ? "bg-white/[0.08] px-4 py-2" : "px-4 py-2"
              }`}
            >
              <span
                className={`block transition-colors ${
                  active ? "text-white" : "text-white/50"
                }`}
              >
                {tab.icon}
              </span>
            </span>
            <span
              className={`text-[11px] font-medium transition-colors ${
                active ? "text-white" : "text-white/40"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
