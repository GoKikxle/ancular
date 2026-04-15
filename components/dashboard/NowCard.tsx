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
 * Home hero — next action card. Adapts to light/dark theme automatically.
 */
export function NowCard({ item }: NowCardProps) {
  const { title, time, eventDate, label, documentId, tripSlug } = item;

  return (
    <section
      className="rounded-[16px] border border-[#EBEBEB] bg-white p-6 dark:border-white/[0.1] dark:bg-gradient-to-b dark:from-white/[0.07] dark:to-white/[0.03] dark:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"
      aria-label="Next action"
    >
      <div className="min-w-0">
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
            label === "Now"
              ? "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-200/90"
              : "border border-[#E5E5E5] bg-[#F5F5F5] text-[#888888] dark:border-transparent dark:bg-white/[0.08] dark:text-white/50"
          }`}
        >
          {label}
        </span>

        <p className="mt-4 font-mono text-[15px] font-semibold tabular-nums tracking-tight text-sky-500 dark:text-sky-400">
          {time}
        </p>

        <h2 className="mt-1.5 text-[20px] font-bold leading-snug tracking-[-0.02em] text-[#111111] dark:text-white">
          {title}
        </h2>

        {eventDate && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#9A9A9A] dark:text-white/45">
            {formatEventDate(eventDate)}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Link
          href={`/trips/${tripSlug}`}
          className="inline-flex min-h-[40px] items-center justify-center rounded-[12px] border border-[#E5E5E5] bg-white px-4 py-2 text-[13px] font-semibold text-[#444444] active:scale-[0.97] dark:border-white/[0.14] dark:bg-white/[0.06] dark:text-white/90 dark:hover:bg-white/[0.1]"
        >
          View trip
        </Link>
        {documentId && (
          <Link
            href={`/documents/${documentId}`}
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[12px] border border-[#E5E5E5] bg-white px-4 py-2 text-[13px] font-semibold text-[#444444] active:scale-[0.97] dark:border-transparent dark:bg-white dark:text-neutral-950 dark:hover:opacity-95"
          >
            <FileIcon />
            View file
          </Link>
        )}
      </div>
    </section>
  );
}
