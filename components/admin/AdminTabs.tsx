"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/events", label: "Events" },
  { href: "/admin/signups", label: "Sign-ups" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/visits", label: "Site visits" },
];

export function AdminTabs({ pending }: { pending: number }) {
  const path = usePathname();
  return (
    <nav className="adm-tabs" aria-label="Dashboard sections">
      {TABS.map((t) => {
        const active = path === t.href || path.startsWith(`${t.href}/`);
        return (
          <Link key={t.href} href={t.href} className="adm-tab" aria-current={active ? "page" : undefined}>
            {t.label}
            {t.href === "/admin/verification" && pending > 0 && <span className="adm-count">{pending}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
