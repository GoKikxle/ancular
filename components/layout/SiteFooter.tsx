import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <LogoMark size={20} />
          <span>Ancular. Made for Nigerian events.</span>
        </div>
        <nav className="flex gap-5">
          <Link href="/privacy" className="hover:text-indigo">
            Privacy
          </Link>
          <Link href="/login" className="hover:text-indigo">
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
