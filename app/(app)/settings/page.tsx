import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { ClearSearchForm, DeleteAccountForm, ProfileForm } from "./SettingsForms";
import { PlanSection } from "@/components/billing/PlanSection";
import {
  FREE_PHOTOS_PER_EVENT,
  PRO_PHOTOS_PER_EVENT,
  PRO_PRICE_PENCE,
  billingEnabled,
  formatPrice,
} from "@/lib/billing";
import { readLiveEventAllowance } from "@/lib/live-events";

export const metadata: Metadata = { title: "Settings" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-hairline py-8 md:grid-cols-[1fr_2fr] md:gap-10 md:py-10">
      <h2 className="t-title">{title}</h2>
      <div className="max-w-md">{children}</div>
    </section>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ paid?: string }> }) {
  const { paid } = await searchParams;
  const { supabase, user } = await getUser();
  if (!user) redirect("/login?next=/settings");

  const name = (user.user_metadata?.full_name as string | undefined)?.trim() ?? "";
  const billingOn = billingEnabled();
  const { data: billing } = await supabase
    .from("host_billing")
    .select("plan, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();
  const live = await readLiveEventAllowance(supabase, user.id);
  const renews = billing?.current_period_end
    ? new Date(billing.current_period_end as string).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
    : null;

  return (
    <div>
      <h1 className="display">Settings</h1>
      <div className="mt-10 md:mt-16">
        <Section title="Account">
          <ProfileForm name={name} email={user.email ?? ""} />
        </Section>
        <Section title="Plan and billing">
          <PlanSection
            plan={live.plan}
            renews={renews}
            proPrice={formatPrice(PRO_PRICE_PENCE)}
            proLimit={PRO_PHOTOS_PER_EVENT}
            freeLimit={FREE_PHOTOS_PER_EVENT}
            liveUsed={Number.isFinite(live.used) ? live.used : 0}
            justPaid={paid === "1"}
            billingOn={billingOn}
          />
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
