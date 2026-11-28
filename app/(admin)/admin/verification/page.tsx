import { VerifyOrganisers, type VerifiedRow } from "@/components/admin/VerifyOrganisers";
import { createAdminClient } from "@/lib/supabase/server";

export default async function AdminVerification() {
  const { data } = await createAdminClient()
    .from("organiser_verifications")
    .select("user_id, org_name, website_domain, contact_email, status, requested_at, decided_at, note")
    .order("requested_at", { ascending: false });
  return (
    <div className="space-y-10">
      <h1 className="display">Verification</h1>
      <VerifyOrganisers rows={(data ?? []) as VerifiedRow[]} />
    </div>
  );
}
