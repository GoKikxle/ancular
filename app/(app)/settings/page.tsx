import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { getCurrentProfile } from "@/lib/profile";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
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
          fullName={profile.full_name}
          avatarId={profile.avatar_id}
          email={profile.email ?? ""}
        />
      </PageContainer>
    </main>
  );
}
