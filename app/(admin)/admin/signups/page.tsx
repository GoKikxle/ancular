import { KpiTile, LoadError, PageHead } from "@/components/admin/AdminParts";
import { loadOverview, n, pct, when } from "@/lib/admin-overview";

export default async function AdminSignups() {
  const { o, error } = await loadOverview();
  if (!o) return <LoadError error={error} />;
  const t = o.totals;
  return (
    <div className="space-y-10">
      <PageHead title="Sign-ups" o={o} />
      <ul className="grid gap-3 sm:grid-cols-2">
        <KpiTile
          label="Sign-ups"
          value={t.users}
          change={t.users_7d}
          note={`${pct(t.users_confirmed, t.users)} confirmed their email · ${n(t.hosts)} have hosted`}
          o={o}
          k="signups"
        />
      </ul>
      <section aria-labelledby="latest-signups">
        <h2 id="latest-signups" className="t-title">
          Latest sign-ups
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[0.875rem]">
            <thead className="t-meta">
              <tr className="border-b border-hairline">
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Signed up</th>
                <th className="py-2 pr-4 font-medium">Email confirmed</th>
                <th className="py-2 text-right font-medium">Events hosted</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {o.recent_signups.map((s, i) => (
                <tr key={`${s.email}-${i}`} className="border-b border-hairline">
                  <td className="py-2.5 pr-4">{s.email ?? "–"}</td>
                  <td className="t-meta py-2.5 pr-4">{when(s.created_at)}</td>
                  <td className="py-2.5 pr-4">{s.confirmed ? "Yes" : <span className="t-meta">Not yet</span>}</td>
                  <td className="py-2.5 text-right">{n(s.events)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
