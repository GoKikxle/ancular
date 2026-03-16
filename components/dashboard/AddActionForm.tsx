"use client";

import { useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { addManualActionAction } from "@/app/trips/[tripId]/actions";
import { DatePicker } from "@/components/ui/DatePicker";

// ── Action type config ────────────────────────────────────────────────────────

type ActionTypeValue =
  | "train"
  | "flight"
  | "pickup"
  | "hotel"
  | "restaurant"
  | "activity"
  | "other";

const ACTION_TYPES: {
  value: ActionTypeValue;
  label: string;
  titlePlaceholder: string;
  routeLabel: string;
  routePlaceholder: string;
}[] = [
  {
    value: "train",
    label: "Train",
    titlePlaceholder: "e.g. Train to London",
    routeLabel: "Route",
    routePlaceholder: "e.g. Birmingham New St → London Euston",
  },
  {
    value: "flight",
    label: "Flight",
    titlePlaceholder: "e.g. Flight to Barcelona",
    routeLabel: "Route",
    routePlaceholder: "e.g. London Heathrow → Barcelona Airport",
  },
  {
    value: "pickup",
    label: "Pickup",
    titlePlaceholder: "e.g. Taxi to Heathrow",
    routeLabel: "Route",
    routePlaceholder: "e.g. Hotel → Terminal 2",
  },
  {
    value: "hotel",
    label: "Hotel",
    titlePlaceholder: "e.g. Hotel check-in",
    routeLabel: "Venue",
    routePlaceholder: "e.g. Best Western Hotel, London",
  },
  {
    value: "restaurant",
    label: "Restaurant",
    titlePlaceholder: "e.g. Dinner reservation",
    routeLabel: "Venue",
    routePlaceholder: "e.g. El Nacional, Las Ramblas",
  },
  {
    value: "activity",
    label: "Activity",
    titlePlaceholder: "e.g. City walking tour",
    routeLabel: "Location",
    routePlaceholder: "e.g. Camp Nou, Barcelona",
  },
  {
    value: "other",
    label: "Other",
    titlePlaceholder: "e.g. Meeting at airport",
    routeLabel: "Location",
    routePlaceholder: "e.g. Terminal 3, Arrivals hall",
  },
];

// ── Animation ─────────────────────────────────────────────────────────────────

const slide = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-white placeholder-white/20 transition-colors focus:border-white/[0.15] focus:outline-none";

const labelCls =
  "mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/30";

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  tripId: string;
  tripSlug: string;
  hasExistingItems: boolean;
};

type FormState = "idle" | "success" | { error: string };

export function AddActionForm({ tripId, tripSlug, hasExistingItems }: Props) {
  const [open, setOpen] = useState(!hasExistingItems);
  const [selectedType, setSelectedType] = useState<ActionTypeValue>("train");
  const [formState, setFormState] = useState<FormState>("idle");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const typeConfig = ACTION_TYPES.find((t) => t.value === selectedType)!;

  function close() {
    setOpen(false);
    setFormState("idle");
    formRef.current?.reset();
    setSelectedType("train");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setFormState("idle");

    startTransition(async () => {
      const result = await addManualActionAction(tripId, tripSlug, formData);

      if (result.error) {
        setFormState({ error: result.error });
      } else {
        setFormState("success");
        setTimeout(close, 1600);
      }
    });
  }

  const errorMessage =
    typeof formState === "object" && "error" in formState
      ? formState.error
      : null;

  return (
    <div
      className={`rounded-3xl border transition-colors ${
        open
          ? "border-white/[0.09] bg-white/[0.04]"
          : "border-dashed border-white/[0.12] bg-transparent"
      } p-5`}
    >
      {/* ── Header row ──────────────────────────────────────────────────────── */}
      {open ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.1em] text-white/35">
            New action
          </p>
          <button
            type="button"
            onClick={close}
            disabled={isPending}
            className="flex-shrink-0 rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1 text-[12px] text-white/45 transition-colors hover:text-white/60 disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      ) : (
        /* ── Collapsed — full-row tappable button ──────────────────────────── */
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3"
        >
          {/* + circle */}
          <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border border-white/[0.20] text-[13px] leading-none text-white/40">
            +
          </span>
          <span className="flex-1 text-left text-[13px] text-white/50">
            Add action
          </span>
          {/* Chevron — signals "tap to expand" */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className="flex-shrink-0 text-white/20"
          >
            <path
              d="M3.5 5.5L7 9l3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* ── Expandable form ─────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="add-action-panel"
            variants={slide}
            initial="hidden"
            animate="show"
            exit="exit"
            className="overflow-hidden"
          >
            {formState === "success" ? (
              /* ── Success banner ─────────────────────────────────────────── */
              <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  className="flex-shrink-0 text-emerald-400"
                >
                  <path
                    d="M2.5 7L5.5 10L11.5 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-[13px] text-emerald-300">
                  Action added to timeline.
                </p>
              </div>
            ) : (
              /* ── Form ───────────────────────────────────────────────────── */
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="mt-5 space-y-4"
              >
                {/* ── Type pill selector ────────────────────────────────────
                     Wrapping flex row — all types visible, no scrolling needed.
                     Selected pill gets sky tint; unselected stays muted. */}
                <div>
                  <p className={labelCls}>Type</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ACTION_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setSelectedType(t.value)}
                        className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
                          selectedType === t.value
                            ? "border-sky-400/35 bg-sky-500/[0.13] text-sky-300"
                            : "border-white/[0.09] bg-white/[0.03] text-white/40 hover:text-white/60"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {/* Hidden input so action_type is part of FormData on submit */}
                  <input type="hidden" name="action_type" value={selectedType} />
                </div>

                {/* ── Title ────────────────────────────────────────────────── */}
                <div>
                  <label htmlFor="action-title" className={labelCls}>
                    Title
                  </label>
                  <input
                    id="action-title"
                    name="title"
                    type="text"
                    required
                    placeholder={typeConfig.titlePlaceholder}
                    className={inputCls}
                  />
                </div>

                {/* ── Date ──────────────────────────────────────────────────── */}
                <div>
                  <label htmlFor="action-date" className={labelCls}>
                    Date
                  </label>
                  <DatePicker
                    id="action-date"
                    name="event_date"
                    required
                    size="sm"
                  />
                </div>

                {/* ── Start time + End time ─────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="action-start" className={labelCls}>
                      Start time
                    </label>
                    <input
                      id="action-start"
                      name="start_time"
                      type="time"
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="action-end" className={labelCls}>
                      End{" "}
                      <span className="normal-case text-white/20">(optional)</span>
                    </label>
                    <input
                      id="action-end"
                      name="end_time"
                      type="time"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* ── Route / venue ─────────────────────────────────────────── */}
                <div>
                  <label htmlFor="action-route" className={labelCls}>
                    {typeConfig.routeLabel}{" "}
                    <span className="normal-case text-white/20">(optional)</span>
                  </label>
                  <input
                    id="action-route"
                    name="route"
                    type="text"
                    placeholder={typeConfig.routePlaceholder}
                    className={inputCls}
                  />
                </div>

                {/* ── Notes ────────────────────────────────────────────────── */}
                <div>
                  <label htmlFor="action-note" className={labelCls}>
                    Notes{" "}
                    <span className="normal-case text-white/20">(optional)</span>
                  </label>
                  <textarea
                    id="action-note"
                    name="note"
                    rows={2}
                    placeholder="Details, reminders, or booking references"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {/* ── Inline error ─────────────────────────────────────────── */}
                {errorMessage && (
                  <p className="rounded-2xl border border-red-500/20 bg-red-500/[0.07] px-3.5 py-2.5 text-[12px] text-red-300">
                    {errorMessage}
                  </p>
                )}

                {/* ── Footer actions ────────────────────────────────────────── */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={close}
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
                    {isPending ? "Saving…" : "Add to timeline"}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
