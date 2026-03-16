"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { updateTimelineItemAction } from "@/app/trips/[tripId]/actions";
import type { TimelineItem } from "./TimelineCard";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  item: TimelineItem;
  tripSlug: string;
  onCancel: () => void;
  /** Called after a successful save so the parent can close the form. */
  onSaved: () => void;
};

type EditState = "idle" | { error: string };

// ─── Shared style tokens ────────────────────────────────────────────────────────

// h-10 (no py-*) locks every standalone control to the same 40px rendered height
// across all input types (text, date, time) regardless of browser quirks.
const inputCls =
  "h-10 w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 text-[13px] text-white placeholder-white/20 transition-colors focus:border-white/[0.15] focus:outline-none";

const labelCls =
  "mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/30";

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Inline edit form for a single timeline item.
 *
 * Rendered inside TimelineCard as a slide-in panel below the item row.
 * The note field shows the full raw packed note (route · ends HH:MM · text)
 * so the user can edit everything in one place until dedicated DB columns exist.
 */
export function EditTimelineItemForm({ item, tripSlug, onCancel, onSaved }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editState, setEditState] = useState<EditState>("idle");

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
    /*
     * Top border anchors the form visually below the dimmed item row.
     * The pl-[31px] indentation (applied by TimelineCard's wrapper) aligns
     * the form content with the item's text column, not the state dot.
     */
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border-t border-white/[0.07] pt-4 pb-1"
    >

      {/* ── Context micro-label ─────────────────────────────────────────────── */}
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/22">
        Edit action
      </p>

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

      {/* ── When: compound date + time card ─────────────────────────────────
           Both rows are locked to h-10 so the card has a predictable height
           (10 + 1px divider + 10 = ~81px) regardless of the browser's native
           date/time input rendering. */}
      <div>
        <p className={labelCls}>When</p>
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">

          {/* Date row — h-10, full width */}
          <input
            name="event_date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Date"
            className="h-10 w-full bg-transparent px-3.5 text-[13px] text-white outline-none [color-scheme:dark]"
          />

          {/* Row divider */}
          <div className="h-px bg-white/[0.06]" />

          {/* Time row — explicit h-10 wrapper keeps it equal to the date row */}
          <div className="flex h-10 items-center gap-2 px-3.5">
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

      {/* ── Note ───────────────────────────────────────────────────────────────
           min-h-[80px] + py-3 gives ~2 lines of space without relying on the
           browser's interpretation of rows="2", which varies. resize-none keeps
           the layout stable and intentional. */}
      <div>
        <label htmlFor={`edit-note-${item.id}`} className={labelCls}>
          Note{" "}
          <span className="normal-case text-white/20">(optional)</span>
        </label>
        <textarea
          id={`edit-note-${item.id}`}
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Route, venue, booking reference…"
          className="min-h-[80px] w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-3 text-[13px] leading-relaxed text-white placeholder-white/20 transition-colors focus:border-white/[0.15] focus:outline-none"
        />
      </div>

      {/* ── Inline error ───────────────────────────────────────────────────── */}
      {errorMsg && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/[0.07] px-3.5 py-2.5 text-[12px] text-red-300">
          {errorMsg}
        </p>
      )}

      {/* ── CTA row ────────────────────────────────────────────────────────────
           Cancel is fixed-width so the Save button always fills most of the row.
           Both buttons are h-12 (py-3 + text line) for adequate touch targets. */}
      <div className="flex gap-2 pt-0.5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="w-20 flex-shrink-0 rounded-2xl border border-white/[0.07] py-3 text-[13px] text-white/38 transition-colors hover:text-white/55 disabled:opacity-40"
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={isPending}
          className="flex-1 rounded-2xl border border-sky-400/25 bg-sky-500/[0.18] py-3 text-[13px] font-semibold text-sky-200 transition-colors hover:bg-sky-500/[0.25] disabled:opacity-40"
        >
          {isPending ? "Saving…" : "Save changes"}
        </motion.button>
      </div>

    </form>
  );
}
