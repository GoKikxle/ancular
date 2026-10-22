import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
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
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo href="/dashboard" />
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[16rem] truncate text-sm text-ink-muted sm:inline">{name}</span>
            {user ? (
              <form action={signOut}>
                <button className="btn btn-quiet btn-sm" type="submit">
                  Sign out
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">{children}</main>
    </div>
  );
}
