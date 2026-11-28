import { Sparkline } from "@/components/admin/Sparkline";
import { n, when, type Daily, type Overview } from "@/lib/admin-overview";

export function PageHead({ title, o }: { title: string; o: Overview }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display">{title}</h1>
        <p className="t-meta mt-3">Updated {when(o.generated_at)} · trends cover the last 30 days</p>
      </div>
    </header>
  );
}

export function LoadError({ error }: { error: string | null }) {
  return (
    <div className="max-w-xl">
      <p className="t-lead t-muted">The dashboard couldn&apos;t load its numbers.</p>
      <p className="t-meta mt-4">{error}</p>
    </div>
  );
}

export function KpiTile({
  label,
  value,
  change,
  note,
  o,
  k,
}: {
  label: string;
  value: number;
  change: number;
  note: string;
  o: Overview;
  k: keyof Omit<Daily, "day">;
}) {
  return (
    <li className="rounded-[12px] border border-hairline p-5">
      <p className="t-meta">{label}</p>
      <p className="mt-2 text-[2.25rem] font-semibold leading-none tracking-[-0.04em] tabular-nums">{n(value)}</p>
      <p className="t-meta mt-2 tabular-nums">
        <span className="font-semibold text-ink">+{n(change)}</span> in the last 7 days
      </p>
      <div className="mt-4">
        <Sparkline days={o.daily.map((d) => d.day)} values={o.daily.map((d) => Number(d[k]))} label={`${label} per day`} />
      </div>
      <p className="t-meta mt-3">{note}</p>
    </li>
  );
}

export function Fact({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <li className="rounded-[12px] bg-fill px-5 py-4">
      <p className="t-meta">{label}</p>
      <p className="mt-1 text-[1.5rem] font-semibold tracking-[-0.03em] tabular-nums">{value}</p>
      <p className="t-meta">{sub}</p>
    </li>
  );
}

export function RankList({ title, rows, unit }: { title: string; rows: [string, number][]; unit: string }) {
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
