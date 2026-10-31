import { redirect } from "next/navigation";
import { AccountButton, SiteHeader } from "@/components/layout/SiteHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { getUser } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getUser();
  if (!user && process.env.NODE_ENV !== "development") redirect("/login");

  const name = user
    ? (user.user_metadata?.full_name as string | undefined)?.trim() || user.email
    : "Local preview";

  return (
    <div className="min-h-dvh">
      <SiteHeader
        logoHref="/dashboard"
        nav={[
          { href: "/dashboard", label: "Events" },
          { href: "/settings", label: "Settings" },
        ]}
        action={
          user ? (
            <>
              <form action={signOut}>
                <SubmitButton className="nav-link" pendingLabel="Signing out…">
                  Sign out
                </SubmitButton>
              </form>
              <AccountButton name={name ?? ""} />
            </>
          ) : (
            <span className="t-meta">Local preview</span>
          )
        }
      />
      <main className="container-page pb-24 pt-10 md:pt-16">{children}</main>
    </div>
  );
}
