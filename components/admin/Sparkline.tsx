/**
 * A 30-day trend for one measure: one line over a faint area.
 * Hover any day for its date and value (native tooltip, no script).
 */
export function Sparkline({
  days,
  values,
  label,
}: {
  days: string[];
  values: number[];
  label: string;
}) {
  const W = 300;
  const H = 56;
  const pad = 4;
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? (W - pad * 2) / (values.length - 1) : 0;
  const x = (i: number) => pad + i * step;
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2);
  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(values.length - 1).toFixed(1)} ${H - pad} L${x(0).toFixed(1)} ${H - pad} Z`;
  const last = values.length - 1;
  const total = values.reduce((a, b) => a + b, 0);
  const fmt = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block h-14 w-full"
      role="img"
      aria-label={`${label}: ${total.toLocaleString("en-GB")} over the last ${values.length} days, ${values[last] ?? 0} today`}
    >
      <line x1={pad} x2={W - pad} y1={H - pad} y2={H - pad} stroke="var(--hairline)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <path d={area} fill="var(--ink)" fillOpacity="0.06" />
      <path d={line} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {values.map((v, i) => (
        <rect key={days[i]} x={x(i) - step / 2} y={0} width={Math.max(step, 4)} height={H} fill="transparent">
          <title>{`${fmt(days[i])}: ${v.toLocaleString("en-GB")}`}</title>
        </rect>
      ))}
    </svg>
  );
}
