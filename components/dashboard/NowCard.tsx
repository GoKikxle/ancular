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
  light?: boolean;
};

/**
 * Home hero — next action. Supports dark (default) and light mode.
 */
export function NowCard({ item, light = false }: NowCardProps) {
  const { title, time, eventDate, label, documentId, tripSlug } = item;

  if (light) {
    return (
      <section
        className="rounded-[16px] border border-[#EBEBEB] bg-white p-6"
        aria-label="Next action"
      >
        <div className="min-w-0">
          <span className="inline-block rounded-full border border-[#E5E5E5] bg-[#F5F5F5] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#888888]">
            {label}
          </span>

          <p className="mt-4 font-mono text-[15px] font-semibold tabular-nums tracking-tight text-sky-500">
            {time}
          </p>

          <h2 className="mt-1.5 text-[20px] font-bold leading-snug tracking-[-0.02em] text-[#111111]">
            {title}
          </h2>

          {eventDate && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#9A9A9A]">
              {formatEventDate(eventDate)}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link
            href={`/trips/${tripSlug}`}
            className="inline-flex min-h-[40px] items-center justify-center rounded-[12px] border border-[#E5E5E5] bg-white px-4 py-2 text-[13px] font-semibold text-[#444444] active:scale-[0.97]"
          >
            View trip
          </Link>
          {documentId && (
            <Link
              href={`/documents/${documentId}`}
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[12px] border border-[#E5E5E5] bg-white px-4 py-2 text-[13px] font-semibold text-[#444444] active:scale-[0.97]"
            >
              <FileIcon />
              View file
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-6 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"
      aria-label="Next action"
    >
      <div className="min-w-0">
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
            label === "Now" ? "bg-amber-500/15 text-amber-200/90" : "bg-white/[0.08] text-white/50"
          }`}
        >
          {label}
        </span>

        <p className="mt-4 font-mono text-[15px] font-semibold tabular-nums tracking-tight text-sky-400">
          {time}
        </p>

        <h2 className="mt-1.5 text-[22px] font-bold leading-snug tracking-[-0.02em] text-white">
          {title}
        </h2>

        {eventDate && (
          <p className="mt-2 text-[13px] leading-relaxed text-white/45">{formatEventDate(eventDate)}</p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <Link
          href={`/trips/${tripSlug}`}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.06] px-4 py-2.5 text-[13px] font-semibold text-white/90 transition-colors hover:bg-white/[0.1] active:scale-[0.98]"
        >
          View trip
        </Link>
        {documentId && (
          <Link
            href={`/documents/${documentId}`}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-semibold text-neutral-950 transition-opacity hover:opacity-95 active:scale-[0.98]"
          >
            <FileIcon />
            View file
          </Link>
        )}
      </div>
    </section>
  );
}
