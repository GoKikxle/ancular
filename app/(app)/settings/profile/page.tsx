import { redirect } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { BackButton } from "@/components/layout/BackButton";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profiles";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(user.id);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <div className="mb-6">
          <BackButton href="/settings" label="Back to settings" />
        </div>

        <header className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/35">
            Profile
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">
            Your profile
          </h1>
          <p className="mt-1.5 text-[14px] text-white/40">
            Update your name and avatar
          </p>
        </header>

        <ProfileForm
          displayName={profile?.display_name ?? null}
          avatarId={profile?.avatar_id ?? "avatar_1"}
          email={user.email ?? ""}
        />
      </PageContainer>
    </main>
  );
}
