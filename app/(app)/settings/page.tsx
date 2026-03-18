import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <header className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/35">
            Settings
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">
            Preferences
          </h1>
          <p className="mt-1.5 text-[14px] text-white/40">
            Manage your app and account
          </p>
        </header>

        <div className="space-y-3">
          <Link
            href="/settings/profile"
            className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 text-[15px] text-white/85 transition-colors hover:bg-white/[0.06]"
          >
            <span>Profile</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/35"><path d="M9 18l6-6-6-6"/></svg>
          </Link>
          <Link
            href="/"
            className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 text-[15px] text-white/85 transition-colors hover:bg-white/[0.06]"
          >
            <span>Notifications</span>
            <span className="text-[13px] text-white/35">Coming soon</span>
          </Link>
          <Link
            href="/"
            className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 text-[15px] text-white/85 transition-colors hover:bg-white/[0.06]"
          >
            <span>Data & privacy</span>
            <span className="text-[13px] text-white/35">Coming soon</span>
          </Link>

          <div className="mt-8 border-t border-white/[0.06] pt-6">
            <SignOutButton />
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
