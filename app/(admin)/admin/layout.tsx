import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { isAdmin } from "@/lib/admin";
import { createAdminClient, getUser } from "@/lib/supabase/server";
import { signOut } from "@/app/(app)/actions";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * The Ancular dashboard. Only for the emails in ADMIN_EMAILS, and those accounts only see this:
 * no events, profile or settings (see the redirects in the app layout and /home).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, emailVerified } = await getUser();
  // The email must be confirmed, or anyone could sign up with an admin address.
  if (!user || !emailVerified || !isAdmin(user.email)) notFound();

  const { count } = await createAdminClient()
    .from("organiser_verifications")
    .select("user_id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="min-h-dvh">
      <SiteHeader
        logoHref="/admin"
        action={
          <>
            <span className="t-meta hidden sm:inline">{user.email}</span>
            <form action={signOut}>
              <SubmitButton className="nav-link" pendingLabel="Signing out…">
                Sign out
              </SubmitButton>
            </form>
          </>
        }
      />
      <div className="adm-top">
        <div className="container-page">
          <AdminTabs pending={count ?? 0} />
        </div>
      </div>
      <main className="container-page pb-24 pt-10 md:pt-14">{children}</main>
    </div>
  );
}
