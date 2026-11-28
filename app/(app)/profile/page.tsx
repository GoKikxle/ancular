import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { loadOrgProfile } from "@/lib/org-profile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { VerificationSection } from "@/components/profile/VerificationSection";

export const metadata: Metadata = { title: "Organisation profile" };

function Section({ n, title, sub, done, children }: { n: number; title: string; sub: string; done: boolean; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-hairline py-8 md:grid-cols-[1fr_2fr] md:gap-10 md:py-10">
      <div>
        <p className="t-meta">
          {String(n).padStart(2, "0")} {done ? "· Done" : ""}
        </p>
        <h2 className="t-title mt-1">{title}</h2>
        <p className="t-item-sub mt-2 max-w-xs">{sub}</p>
      </div>
      <div className="max-w-md">{children}</div>
    </section>
  );
}

export default async function ProfilePage() {
  const { supabase, user } = await getUser();
  if (!user) redirect("/login?next=/profile");
  const { profile, verification, steps } = await loadOrgProfile(supabase, user.id);

  return (
    <div>
      <h1 className="display">Organisation profile</h1>
      <p className="t-lead mt-4 max-w-2xl">
        Set this up once. Every event you create uses it, so guests opening your links see who it&apos;s from.
      </p>
      <p className="t-meta mt-3">
        {steps.done} of {steps.total} done
      </p>
      <div className="mt-10 md:mt-14">
        <Section
          n={1}
          title="Name, website and logo"
          sub="Shown on your invite pages and the “photos coming soon” page."
          done={steps.details && steps.logo}
        >
          <ProfileForm userId={user.id} profile={profile} />
        </Section>
        <Section
          n={2}
          title="Get verified"
          sub="For organisations with their own website. Guests see a Verified badge with your name and website."
          done={steps.verification}
        >
          <VerificationSection current={verification} defaults={{ name: profile?.org_name, website: profile?.website }} />
        </Section>
      </div>
    </div>
  );
}
