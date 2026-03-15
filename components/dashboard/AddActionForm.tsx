"use client";

import { useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { addManualActionAction } from "@/app/trips/[tripId]/actions";

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
    label: "Pickup / Transfer",
    titlePlaceholder: "e.g. Taxi to Heathrow",
    routeLabel: "Route",
    routePlaceholder: "e.g. Hotel → Terminal 2",
  },
  {
    value: "hotel",
    label: "Hotel check-in",
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

// ── Input style shared across all fields ──────────────────────────────────────

const inputCls =
  "w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-white placeholder-white/20 transition-colors focus:border-white/[0.18] focus:outline-none";

const labelCls =
  "mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/30";

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  tripId: string;
  tripSlug: string;
  /** When false the form auto-opens so a new trip immediately prompts the user. */
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
        // Auto-close after the user reads the confirmation.
        // revalidatePath in the server action will refresh the timeline.
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
          : "border-dashed border-white/[0.10] bg-transparent"
      } p-5`}
    >
      {/* ── Header row ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        {open ? (
          <p className="text-[11px] uppercase tracking-[0.1em] text-white/35">
            New action
          </p>
        ) : (
          /* Collapsed — full-row tappable button */
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex flex-1 items-center gap-2.5 text-left"
          >
            <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border border-white/[0.18] text-[14px] leading-none text-white/35">
              +
            </span>
            <span className="text-[13px] text-white/40">Add action</span>
          </button>
        )}

        {open && (
          <button
            type="button"
            onClick={close}
            disabled={isPending}
            className="flex-shrink-0 rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1 text-[12px] text-white/45 transition-colors hover:text-white/60 disabled:opacity-40"
          >
            Cancel
          </button>
        )}
      </div>

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
                {/* ── Action type ──────────────────────────────────────── */}
                <div>
                  <label htmlFor="action-type" className={labelCls}>
                    Type
                  </label>
                  <select
                    id="action-type"
                    name="action_type"
                    value={selectedType}
                    onChange={(e) =>
                      setSelectedType(e.target.value as ActionTypeValue)
                    }
                    className="w-full rounded-2xl border border-white/[0.08] bg-[#0a0a0a] px-3.5 py-2.5 text-[13px] text-white transition-colors focus:border-white/[0.18] focus:outline-none"
                  >
                    {ACTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value} className="bg-neutral-900">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ── Title ────────────────────────────────────────────── */}
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

                {/* ── Start time + End time ─────────────────────────────── */}
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
                      End time{" "}
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

                {/* ── Route / venue ─────────────────────────────────────── */}
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

                {/* ── Notes ────────────────────────────────────────────── */}
                <div>
                  <label htmlFor="action-note" className={labelCls}>
                    Notes{" "}
                    <span className="normal-case text-white/20">(optional)</span>
                  </label>
                  <textarea
                    id="action-note"
                    name="note"
                    rows={2}
                    placeholder="Any extra details, reminders, or booking references"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {/* ── Inline error ─────────────────────────────────────── */}
                {errorMessage && (
                  <p className="rounded-2xl border border-red-500/20 bg-red-500/[0.07] px-3.5 py-2.5 text-[12px] text-red-300">
                    {errorMessage}
                  </p>
                )}

                {/* ── Actions ──────────────────────────────────────────── */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={close}
                    disabled={isPending}
                    className="flex-1 rounded-2xl border border-white/[0.07] py-2.5 text-[13px] text-white/40 transition-colors hover:text-white/60 disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    disabled={isPending}
                    className="flex-[2] rounded-2xl border border-sky-400/20 bg-sky-500/15 py-2.5 text-[13px] font-medium text-sky-300 transition-colors hover:bg-sky-500/20 disabled:opacity-40"
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
