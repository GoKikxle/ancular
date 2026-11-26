"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { leaveEvent } from "@/app/actions/leave-event";
import type { BoardRow } from "@/lib/dashboard";

type TabId = "hosting" | "joined";
const PAST_PREVIEW = 5;
const SEARCH_FROM = 10;

/**
 * The events list: a tab for events you host and one for events you joined
 * (shown only when you have both), each split into live and past. Past events
 * fold away after five, and a search box appears once a tab passes ten.
 */
export function EventsBoard({
  hosting,
  joined,
  defaultTab,
}: {
  hosting: BoardRow[];
  joined: BoardRow[];
  defaultTab: TabId;
}) {
  const both = hosting.length > 0 && joined.length > 0;
  const [tab, setTab] = useState<TabId>(
    both ? defaultTab : hosting.length ? "hosting" : "joined",
  );
  const rows = tab === "hosting" ? hosting : joined;

  return (
    <div>
      {both && (
        <div className="eb-tabs" role="tablist" aria-label="Your events">
          {(
            [
              ["hosting", "Hosting", hosting.length],
              ["joined", "Your photos", joined.length],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className="eb-tab"
              onClick={() => setTab(id)}
            >
              {label} <span className="text-ink-4">{count}</span>
            </button>
          ))}
        </div>
      )}
      <Panel key={tab} rows={rows} kind={tab} />
    </div>
  );
}

function Panel({ rows, kind }: { rows: BoardRow[]; kind: TabId }) {
  const [query, setQuery] = useState("");
  const [showAllPast, setShowAllPast] = useState(false);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => `${r.title} ${r.sub}`.toLowerCase().includes(q));
  }, [rows, query]);
  const live = filtered.filter((r) => !r.past);
  const past = filtered.filter((r) => r.past);
  const pastShown = showAllPast || query ? past : past.slice(0, PAST_PREVIEW);

  return (
    <div className="mt-6">
      {rows.length > SEARCH_FROM && (
        <input
          type="search"
          className="field mb-6 max-w-sm"
          placeholder="Search events"
          aria-label="Search events"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      {filtered.length === 0 && (
        <p className="t-item-sub py-6">No events match “{query}”.</p>
      )}

      {live.length > 0 && (
        <Group
          title={kind === "hosting" ? "Live and upcoming" : "Live and upcoming"}
        >
          {live.map((r) => (
            <Row key={r.id} row={r} />
          ))}
        </Group>
      )}

      {past.length > 0 && (
        <Group title="Past">
          {pastShown.map((r) => (
            <Row key={r.id} row={r} />
          ))}
          {!showAllPast && !query && past.length > PAST_PREVIEW && (
            <li>
              <button
                type="button"
                className="eb-more"
                onClick={() => setShowAllPast(true)}
              >
                Show {past.length - PAST_PREVIEW} more past event
                {past.length - PAST_PREVIEW === 1 ? "" : "s"}
              </button>
            </li>
          )}
        </Group>
      )}
    </div>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="eb-group">{title}</h2>
      <ul className="border-t border-hairline">{children}</ul>
    </section>
  );
}

function Row({ row }: { row: BoardRow }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [gone, setGone] = useState(false);
  if (gone) return null;

  return (
    <li className="eb-row" data-past={row.past}>
      <Link href={row.href} className="eb-link">
        <span className="eb-cover" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {row.cover ? <img src={row.cover} alt="" loading="lazy" /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="t-item block truncate">{row.title}</span>
          <span className="t-item-sub block truncate">{row.sub}</span>
          <span className="eb-meta block truncate">{row.meta}</span>
        </span>
        <span className="eb-tags">
          {row.tags.map((t) => (
            <span key={t.label} className="eb-tag" data-tone={t.tone}>
              {t.label}
            </span>
          ))}
        </span>
      </Link>

      {row.action?.kind === "delete" && (
        <Link href={row.action.href} className="eb-action">
          Delete
        </Link>
      )}
      {row.action?.kind === "remove" && !confirming && (
        <button
          type="button"
          className="eb-action"
          onClick={() => setConfirming(true)}
        >
          Remove
        </button>
      )}
      {row.action?.kind === "remove" && confirming && (
        <div className="eb-confirm">
          <p className="t-item-sub">
            Remove this event from your list? Your face data for it is deleted
            and you&apos;ll need the invite link to come back.
          </p>
          {error && <p className="t-meta text-[var(--danger)]">{error}</p>}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await leaveEvent(
                    (row.action as { eventId: string }).eventId,
                  );
                  if (res.error) setError(res.error);
                  else setGone(true);
                })
              }
            >
              {pending ? "Removing…" : "Remove"}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-quiet"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
