"use client";

import { useTransition } from "react";

type TripActionsProps = {
  onDelete: () => Promise<void>;
};

export function TripActions({ onDelete }: TripActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    startTransition(() => onDelete());
  }

  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Delete Trip"}
      </button>
    </div>
  );
}
