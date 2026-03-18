import Link from "next/link";
import type { NowItemView } from "@/lib/now-card";

function formatEventDate(dateStr: string): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3.5 2.5h4.5l3 3v6a1 1 0 01-1 1h-6.5a1 1 0 01-1-1v-8a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 2.5v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type NowCardProps = {
  item: NowItemView;
};

/**
 * Large card at top of dashboard showing what to do right now.
 * Uses contextual label (Now / Next) and optional "View File" when document_id exists.
 */
export function NowCard({ item }: NowCardProps) {
  const { title, time, eventDate, label, fileUrl, tripSlug } = item;

  return (
    <section className="mb-6 rounded-3xl border border-white/[0.1] bg-white/[0.05] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
              label === "Now" ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-white/60"
            }`}
          >
            {label}
          </span>
          <h2 className="mt-3 text-[20px] font-semibold leading-tight tracking-[-0.02em] text-white">
            {title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {eventDate && (
              <span className="text-[13px] text-white/50">{formatEventDate(eventDate)}</span>
            )}
            <span className="font-mono text-[14px] tabular-nums text-white/70">{time}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/trips/${tripSlug}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-[14px] font-medium text-white/90 transition-colors active:scale-[0.98]"
        >
          View trip
        </Link>
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[14px] font-semibold text-neutral-950 transition-opacity active:scale-[0.98]"
          >
            <FileIcon />
            View File
          </a>
        )}
      </div>
    </section>
  );
}
