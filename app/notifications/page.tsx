import { PageContainer } from "@/components/layout/PageContainer";

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <header className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/35">
            Notifications
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">
            Alerts & updates
          </h1>
          <p className="mt-1.5 text-[14px] text-white/40">
            Trip reminders, document expiry, and travel updates
          </p>
        </header>

        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-10 text-center">
          <p className="text-[15px] font-medium text-white/50">
            No notifications yet
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/35">
            When your trips have reminders or updates, they&apos;ll appear here.
          </p>
        </div>
      </PageContainer>
    </main>
  );
}
