import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { ClearSearchForm, DeleteAccountForm, ProfileForm } from "./SettingsForms";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { user } = await getUser();
  if (!user) redirect("/login?next=/settings");

  const name = (user.user_metadata?.full_name as string | undefined)?.trim() ?? "";

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="display text-[2.4rem] text-indigo">Settings</h1>
      <section className="mt-8 rounded-2xl bg-paper p-6 shadow-[0_0_0_1.5px_var(--line)]">
        <h2 className="text-lg font-bold">Account</h2>
        <div className="mt-4">
          <ProfileForm name={name} email={user.email ?? ""} />
        </div>
      </section>
      <section className="mt-6 rounded-2xl bg-paper p-6 shadow-[0_0_0_1.5px_var(--line)]">
        <h2 className="text-lg font-bold">Face search</h2>
        <div className="mt-4">
          <ClearSearchForm />
        </div>
      </section>
      <section className="mt-6 rounded-2xl bg-paper p-6 shadow-[0_0_0_1.5px_var(--line)]">
        <h2 className="text-lg font-bold">Delete account</h2>
        <div className="mt-4">
          <DeleteAccountForm />
        </div>
      </section>
    </div>
  );
}
