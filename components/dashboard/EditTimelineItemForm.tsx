"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { updateTimelineItemAction } from "@/app/trips/[tripId]/actions";
import type { TimelineItem } from "./TimelineCard";

// ─── Styles ────────────────────────────────────────────────────────────────────

const inputCls =
  "h-10 w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 text-[13px] text-white placeholder-white/20 transition-colors focus:border-white/[0.15] focus:outline-none";

const labelCls = "mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/30";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  item: TimelineItem;
  tripSlug: string;
  onCancel: () => void;
  /** Called after a successful save so the parent can close the form. */
  onSaved: () => void;
};

type EditState = "idle" | { error: string };

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Inline edit form for a single timeline item.
 *
 * Rendered inside TimelineCard as a slide-in panel below the item row.
 * Fields: title, date, time, note (full raw note).
 *
 * The note field deliberately shows the raw packed note string (which may
 * contain "Route · ends HH:MM · user text") so the user can edit all parts.
 * Dedicated route and end-time fields will appear once those DB columns exist.
 */
export function EditTimelineItemForm({ item, tripSlug, onCancel, onSaved }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editState, setEditState] = useState<EditState>("idle");

  // Controlled fields pre-populated from the existing item.
  const [title, setTitle] = useState(item.title);
  const [date, setDate] = useState(item.event_date ?? "");
  const [time, setTime] = useState(item.time);
  const [note, setNote] = useState(item.note ?? "");

  const errorMsg = typeof editState === "object" ? editState.error : null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setEditState("idle");

    startTransition(async () => {
      const result = await updateTimelineItemAction(item.id, tripSlug, formData);
      if (result.error) {
        setEditState({ error: result.error });
      } else {
        onSaved();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-1 pt-4">

      {/* ── Title ──────────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor={`edit-title-${item.id}`} className={labelCls}>
          Title
        </label>
        <input
          id={`edit-title-${item.id}`}
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* ── When: date + time compound card ────────────────────────────────── */}
      <div>
        <p className={labelCls}>When</p>
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">

          {/* Date — full width row */}
          <input
            name="event_date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Date"
            className="h-10 w-full bg-transparent px-3.5 text-[13px] text-white outline-none [color-scheme:dark]"
          />

          {/* Internal divider */}
          <div className="h-px bg-white/[0.06]" />

          {/* Time row */}
          <div className="flex items-center gap-2 px-3.5 py-2.5">
            <span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-white/30">
              Time
            </span>
            <input
              name="time"
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-label="Time"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none [color-scheme:dark]"
            />
          </div>

        </div>
      </div>

      {/* ── Note ───────────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor={`edit-note-${item.id}`} className={labelCls}>
          Note{" "}
          <span className="normal-case text-white/20">(optional)</span>
        </label>
        <textarea
          id={`edit-note-${item.id}`}
          name="note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Route, venue, booking reference…"
          className="w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-white placeholder-white/20 transition-colors focus:border-white/[0.15] focus:outline-none"
        />
      </div>

      {/* ── Inline error ───────────────────────────────────────────────────── */}
      {errorMsg && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/[0.07] px-3.5 py-2.5 text-[12px] text-red-300">
          {errorMsg}
        </p>
      )}

      {/* ── Actions ────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-2xl border border-white/[0.07] px-5 py-3 text-[13px] text-white/38 transition-colors hover:text-white/55 disabled:opacity-40"
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={isPending}
          className="flex-1 rounded-2xl border border-sky-400/25 bg-sky-500/[0.20] py-3 text-[13px] font-semibold text-sky-200 transition-colors hover:bg-sky-500/[0.27] disabled:opacity-40"
        >
          {isPending ? "Saving…" : "Save changes"}
        </motion.button>
      </div>

    </form>
  );
}
