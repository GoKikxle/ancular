import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkline } from "@/components/admin/Sparkline";
import { VerifyOrganisers, type VerifiedRow } from "@/components/admin/VerifyOrganisers";
import { isAdmin } from "@/lib/admin";
import { createAdminClient, getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

type Daily = { day: string; signups: number; events: number; photos: number; searches: number; views: number; visits: number };
type Overview = {
  generated_at: string;
  totals: Record<
    | "users" | "users_confirmed" | "users_7d" | "events" | "events_active" | "events_7d" | "hosts" | "photos" | "photos_7d"
    | "guests" | "guests_pending" | "consents" | "searches" | "searches_7d" | "searchers" | "searches_found" | "photos_found"
    | "views_7d" | "visits_7d",
    number
  >;
  daily: Daily[];
  top_pages: { path: string; views: number }[];
  referrers: { source: string; visits: number }[];
  countries: { country: string; visits: number }[];
  recent_events: {
    name: string; kind: string; created_at: string; join_mode: string; status: string;
    host: string | null; photos: number; guests: number; searches: number;
  }[];
  recent_signups: { email: string | null; created_at: string; confirmed: boolean; events: number }[];
};

const n = (x: number) => x.toLocaleString("en-GB");
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "–");
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
const sum = (rows: Daily[], k: keyof Omit<Daily, "day">) => rows.reduce((a, r) => a + Number(r[k]), 0);

function countryName(code: string) {
  if (code === "??") return "Unknown";
  try {
    return new Intl.DisplayNames(["en-GB"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export default async function AdminPage() {
  const { user } = await getUser();
  if (!user || !isAdmin(user.email)) notFound();

  const admin = createAdminClient();
  const [{ data, error }, { data: verified }] = await Promise.all([
    admin.rpc("admin_overview", { p_days: 30 }),
    admin.from("organiser_verifications").select("user_id, verified_name, verified_email, verified_at, note").order("verified_at", { ascending: false }),
  ]);
  if (error || !data) {
    return (
      <div className="max-w-xl">
        <h1 className="display">Dashboard</h1>
        <p className="t-lead t-muted mt-5">
          The dashboard couldn&apos;t load its numbers. If this is the first time, the database update
          (migration 0008) still needs applying.
        </p>
        <p className="t-meta mt-4">{error?.message}</p>
      </div>
    );
  }

  const o = data as Overview;
  const t = o.totals;
  const days = o.daily.map((d) => d.day);
  const series = (k: keyof Omit<Daily, "day">) => o.daily.map((d) => Number(d[k]));

  const tiles = [
    {
      label: "Sign-ups",
      value: t.users,
      change: t.users_7d,
      note: `${pct(t.users_confirmed, t.users)} confirmed their email`,
      key: "signups" as const,
    },
    {
      label: "Events created",
      value: t.events,
      change: t.events_7d,
      note: `${n(t.hosts)} hosts · ${n(t.events_active)} active`,
      key: "events" as const,
    },
    {
      label: "Selfie searches",
      value: t.searches,
      change: t.searches_7d,
      note: `${n(t.searchers)} guests searched · ${pct(t.searches_found, t.searches)} found a photo`,
      key: "searches" as const,
    },
    {
      label: "Site visits",
      value: sum(o.daily, "visits"),
      change: t.visits_7d,
      note: `${n(sum(o.daily, "views"))} page views in 30 days`,
      key: "visits" as const,
      thirtyDay: true,
    },
  ];

  const facts = [
    { label: "Photos uploaded", value: n(t.photos), sub: `+${n(t.photos_7d)} in 7 days` },
    { label: "Guests joined", value: n(t.guests), sub: `${n(t.guests_pending)} waiting for a host` },
    { label: "Agreed to face matching", value: n(t.consents), sub: "active consents" },
    { label: "Photos found for guests", value: n(t.photos_found), sub: "matches kept" },
  ];

  return (
    <div className="space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display">Dashboard</h1>
          <p className="t-meta mt-3">Updated {when(o.generated_at)} · trends cover the last 30 days</p>
        </div>
        <a href="/admin" className="btn btn-quiet btn-sm">
          Refresh
        </a>
      </header>

      <section aria-labelledby="kpis">
        <h2 id="kpis" className="sr-only">
          Key numbers
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((k) => (
            <li key={k.label} className="rounded-[12px] border border-hairline p-5">
              <p className="t-meta">{k.label}{k.thirtyDay ? ", 30 days" : ""}</p>
              <p className="mt-2 text-[2.25rem] font-semibold leading-none tracking-[-0.04em] tabular-nums">{n(k.value)}</p>
              <p className="t-meta mt-2 tabular-nums">
                <span className="font-semibold text-ink">+{n(k.change)}</span> in the last 7 days
              </p>
              <div className="mt-4">
                <Sparkline days={days} values={series(k.key)} label={`${k.label} per day`} />
              </div>
              <p className="t-meta mt-3">{k.note}</p>
            </li>
          ))}
        </ul>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {facts.map((f) => (
            <li key={f.label} className="rounded-[12px] bg-fill px-5 py-4">
              <p className="t-meta">{f.label}</p>
              <p className="mt-1 text-[1.5rem] font-semibold tracking-[-0.03em] tabular-nums">{f.value}</p>
              <p className="t-meta">{f.sub}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="events">
        <h2 id="events" className="t-title">
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

      <section aria-labelledby="signups">
        <h2 id="signups" className="t-title">
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

      <VerifyOrganisers rows={(verified ?? []) as VerifiedRow[]} />

      <section aria-labelledby="traffic" className="grid gap-10 lg:grid-cols-3">
        <h2 id="traffic" className="sr-only">
          Traffic
        </h2>
        <RankList title="Most viewed pages, 7 days" rows={o.top_pages.map((r) => [r.path, r.views])} unit="views" />
        <RankList title="Where visits come from, 30 days" rows={o.referrers.map((r) => [r.source, r.visits])} unit="visits" />
        <RankList
          title="Countries, 30 days"
          rows={o.countries.map((r) => [countryName(r.country), r.visits])}
          unit="visits"
        />
      </section>

      <p className="t-meta max-w-2xl">
        Visits are counted without cookies or anything that identifies a visitor: a visit is a page view that arrived
        from another site or was typed in. Selfie searches record only how many photos were found, never a face.
      </p>
    </div>
  );
}

function RankList({ title, rows, unit }: { title: string; rows: [string, number][]; unit: string }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div>
      <h3 className="t-item">{title}</h3>
      {rows.length === 0 ? (
        <p className="t-meta mt-3">Nothing counted yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map(([name, value]) => (
            <li key={name} className="relative text-[0.875rem]" title={`${name}: ${n(value)} ${unit}`}>
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 rounded-[4px] bg-fill"
                style={{ width: `${(value / max) * 100}%` }}
              />
              <span className="relative flex justify-between gap-3 px-2 py-1">
                <span className="truncate">{name}</span>
                <span className="tabular-nums text-ink-3">{n(value)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
