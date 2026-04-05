"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── ICONS ────────────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function VaultIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      <path d="M12 11v6" />
      <path d="M9 14h6" />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  );
}

// ─── TAB CONFIG ───────────────────────────────────────────────────────────────

type Tab = {
  href: string;
  label: string;
  icon: React.ReactNode;
  matchPaths?: string[];
};

const TABS: Tab[] = [
  { href: "/",          label: "Home",  matchPaths: ["/"],          icon: <HomeIcon /> },
  { href: "/trips",     label: "Trips", matchPaths: ["/trips"],      icon: <RocketIcon /> },
  { href: "/documents", label: "Vault", matchPaths: ["/documents"],  icon: <VaultIcon /> },
  { href: "/stats",     label: "Stats", matchPaths: ["/stats"],      icon: <StatsIcon /> },
];

function isTabActive(pathname: string, tab: Tab): boolean {
  if (pathname === tab.href) return true;
  for (const p of tab.matchPaths ?? []) {
    if (p === pathname) return true;
    if (p !== "/" && pathname.startsWith(p + "/")) return true;
  }
  return false;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex justify-center px-5"
      style={{
        paddingBottom: "max(20px, var(--safe-area-bottom))",
        paddingTop: "10px",
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="inline-flex items-center gap-[2px] rounded-[22px] bg-[#0F0F0F] px-[6px] py-[6px] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {TABS.map((tab) => {
          const active = isTabActive(pathname, tab);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              className={`flex items-center justify-center rounded-[16px] px-[18px] py-[10px] transition-all duration-150 active:scale-90 ${
                active
                  ? "bg-[#2A2A2A] text-white"
                  : "text-white/38 hover:text-white/60"
              }`}
            >
              {tab.icon}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
