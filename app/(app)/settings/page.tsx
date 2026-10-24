import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { ClearSearchForm, DeleteAccountForm, ProfileForm } from "./SettingsForms";

export const metadata: Metadata = { title: "Settings" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-hairline py-8 md:grid-cols-[1fr_2fr] md:gap-10 md:py-10">
      <h2 className="t-title">{title}</h2>
      <div className="max-w-md">{children}</div>
    </section>
  );
}

export default async function SettingsPage() {
  const { user } = await getUser();
  if (!user) redirect("/login?next=/settings");

  const name = (user.user_metadata?.full_name as string | undefined)?.trim() ?? "";

  return (
    <div>
      <h1 className="display">Settings</h1>
      <div className="mt-10 md:mt-16">
        <Section title="Account">
          <ProfileForm name={name} email={user.email ?? ""} />
        </Section>
        <Section title="Face search">
          <ClearSearchForm />
        </Section>
        <Section title="Delete account">
          <DeleteAccountForm />
        </Section>
      </div>
    </div>
  );
}
