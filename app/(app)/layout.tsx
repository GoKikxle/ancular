import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile } from "@/lib/profile";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  return (
    <AppShell
      avatarId={profile?.avatar_id ?? null}
      hasUnreadNotifications={(profile?.notifications_unread_count ?? 0) > 0}
    >
      {children}
    </AppShell>
  );
}
