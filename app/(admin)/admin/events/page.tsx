import { Fact, KpiTile, LoadError, PageHead } from "@/components/admin/AdminParts";
import { loadOverview, n, pct, when } from "@/lib/admin-overview";

export default async function AdminEvents() {
  const { o, error } = await loadOverview();
  if (!o) return <LoadError error={error} />;
  const t = o.totals;
  return (
    <div className="space-y-10">
      <PageHead title="Events" o={o} />
      <ul className="grid gap-3 sm:grid-cols-2">
        <KpiTile label="Events created" value={t.events} change={t.events_7d} note={`${n(t.hosts)} hosts · ${n(t.events_active)} active`} o={o} k="events" />
        <KpiTile
          label="Selfie searches"
          value={t.searches}
          change={t.searches_7d}
          note={`${n(t.searchers)} guests searched · ${pct(t.searches_found, t.searches)} found a photo`}
          o={o}
          k="searches"
        />
      </ul>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Fact label="Photos uploaded" value={n(t.photos)} sub={`+${n(t.photos_7d)} in 7 days`} />
        <Fact label="Guests joined" value={n(t.guests)} sub={`${n(t.guests_pending)} waiting for a host`} />
        <Fact label="Agreed to face matching" value={n(t.consents)} sub="active consents" />
        <Fact label="Photos found for guests" value={n(t.photos_found)} sub="matches kept" />
      </ul>
      <section aria-labelledby="latest-events">
        <h2 id="latest-events" className="t-title">
          Latest events
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[0.875rem]">
            <thead className="t-meta">
              <tr className="border-b border-hairline">
                <th className="py-2 pr-4 font-medium">Event</th>
                <th className="py-2 pr-4 font-medium">Host</th>
                <th className="py-2 pr-4 font-medium">Created</th>
                <th className="py-2 pr-4 text-right font-medium">Photos</th>
                <th className="py-2 pr-4 text-right font-medium">Guests</th>
                <th className="py-2 text-right font-medium">Searches</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {o.recent_events.map((e, i) => (
                <tr key={`${e.name}-${i}`} className="border-b border-hairline">
                  <td className="py-2.5 pr-4">
                    <span className="font-semibold">{e.name}</span>
                    <span className="t-meta ml-2 capitalize">
                      {e.kind} · {e.join_mode === "open" ? "open" : "approval"}
                      {e.status === "archived" ? " · archived" : ""}
                    </span>
                  </td>
                  <td className="t-meta py-2.5 pr-4">{e.host ?? "–"}</td>
                  <td className="t-meta py-2.5 pr-4">{when(e.created_at)}</td>
                  <td className="py-2.5 pr-4 text-right">{n(e.photos)}</td>
                  <td className="py-2.5 pr-4 text-right">{n(e.guests)}</td>
                  <td className="py-2.5 text-right">{n(e.searches)}</td>
                </tr>
              ))}
              {o.recent_events.length === 0 && (
                <tr>
                  <td colSpan={6} className="t-meta py-4">
                    No events yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <p className="t-meta max-w-2xl">Selfie searches record only how many photos were found, never a face.</p>
    </div>
  );
}
