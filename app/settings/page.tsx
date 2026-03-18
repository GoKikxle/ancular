import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <header className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.1em] text-white/35">
            Settings
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">
            Preferences
          </h1>
          <p className="mt-1.5 text-[14px] text-white/40">
            Manage your app and account
          </p>
        </header>

        <div className="space-y-1">
          <Link
            href="/"
            className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 text-[15px] text-white/80 transition-colors hover:bg-white/[0.05]"
          >
            <span>Profile</span>
            <span className="text-white/35">Coming soon</span>
          </Link>
          <Link
            href="/"
            className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 text-[15px] text-white/80 transition-colors hover:bg-white/[0.05]"
          >
            <span>Notifications</span>
            <span className="text-white/35">Coming soon</span>
          </Link>
          <Link
            href="/"
            className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 text-[15px] text-white/80 transition-colors hover:bg-white/[0.05]"
          >
            <span>Data & privacy</span>
            <span className="text-white/35">Coming soon</span>
          </Link>
        </div>
      </PageContainer>
    </main>
  );
}
