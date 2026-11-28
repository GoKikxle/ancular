import { KpiTile, LoadError, PageHead, RankList } from "@/components/admin/AdminParts";
import { countryName, loadOverview, n, sum } from "@/lib/admin-overview";

export default async function AdminVisits() {
  const { o, error } = await loadOverview();
  if (!o) return <LoadError error={error} />;
  return (
    <div className="space-y-10">
      <PageHead title="Site visits" o={o} />
      <ul className="grid gap-3 sm:grid-cols-2">
        <KpiTile
          label="Site visits, 30 days"
          value={sum(o.daily, "visits")}
          change={o.totals.visits_7d}
          note={`${n(sum(o.daily, "views"))} page views in 30 days`}
          o={o}
          k="visits"
        />
      </ul>
      <section aria-label="Traffic" className="grid gap-10 lg:grid-cols-3">
        <RankList title="Most viewed pages, 7 days" rows={o.top_pages.map((r) => [r.path, r.views])} unit="views" />
        <RankList title="Where visits come from, 30 days" rows={o.referrers.map((r) => [r.source, r.visits])} unit="visits" />
        <RankList title="Countries, 30 days" rows={o.countries.map((r) => [countryName(r.country), r.visits])} unit="visits" />
      </section>
      <p className="t-meta max-w-2xl">
        Visits are counted without cookies or anything that identifies a visitor: a visit is a page view that arrived
        from another site or was typed in.
      </p>
    </div>
  );
}
