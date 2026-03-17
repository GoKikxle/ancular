"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { updateTimelineItemAction } from "@/app/trips/[tripId]/actions";
import type { TimelineItem } from "./TimelineCard";
import type { TripDocOption } from "@/lib/timeline-items";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  item: TimelineItem;
  tripSlug: string;
  onCancel: () => void;
  /** Called after a successful save so the parent can close the form. */
  onSaved: () => void;
  /** Documents already attached to this trip. Empty array hides the selector. */
  tripDocs: TripDocOption[];
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
export function EditTimelineItemForm({ item, tripSlug, onCancel, onSaved, tripDocs }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editState, setEditState] = useState<EditState>("idle");

  const [title, setTitle] = useState(item.title);
  const [date, setDate] = useState(item.event_date ?? "");
  const [time, setTime] = useState(item.time);
  const [note, setNote] = useState(item.note ?? "");
  // null = no linked document; "" (empty string) also means no link.
  const [documentId, setDocumentId] = useState<string>(item.document_id ?? "");

  const errorMsg = typeof editState === "object" ? editState.error : null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEditState("idle");

    // Build FormData explicitly from React state rather than from the DOM form
    // element. For controlled <input type="date"> and <input type="time">,
    // new FormData(form) reads the DOM property, which can lag behind React's
    // controlled value on some mobile browsers. Building it from state is
    // unambiguous and always correct.
    const formData = new FormData();
    formData.set("event_date", date);
    formData.set("time", time);
    formData.set("title", title);
    formData.set("note", note);
    // Always include document_id so the action can write null when unlinked.
    // Empty string is normalised to null in the action.
    formData.set("document_id", documentId);

    startTransition(async () => {
      const result = await updateTimelineItemAction(item.id, tripSlug, formData);
      if (result.error) {
        setEditState({ error: result.error });
      } else {
        // router.refresh() forces the RSC to re-render with fresh Supabase data.
        // revalidatePath() (called in the server action) marks the cache stale,
        // but for programmatic server action calls Next.js does NOT automatically
        // refresh the router — the client needs to trigger it explicitly.
        router.refresh();
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

      {/* ── Linked document ─────────────────────────────────────────────────── */}
      <div>
        <label htmlFor={`edit-doc-${item.id}`} className={labelCls}>
          Linked document{" "}
          <span className="normal-case text-white/20">(optional)</span>
        </label>
        {tripDocs.length === 0 ? (
          <p className="text-[12px] leading-relaxed text-white/22">
            No documents attached to this trip yet.
          </p>
        ) : (
          <div className="relative">
            <select
              id={`edit-doc-${item.id}`}
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="h-10 w-full appearance-none rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 pr-9 text-[13px] text-white [color-scheme:dark] transition-colors focus:border-white/[0.15] focus:outline-none"
            >
              <option value="">— None —</option>
              {tripDocs.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                  {" — "}
                  {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
                </option>
              ))}
            </select>
            {/* Chevron overlay — keeps the control height at h-10 */}
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}
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
