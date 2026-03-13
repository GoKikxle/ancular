"use client";

import { useState } from "react";

type TripActionsProps = {
  tripId: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

export function TripActions({ tripId, deleteAction }: TripActionsProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300"
      >
        Delete Trip
      </button>
    );
  }

  return (
    <form action={deleteAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={tripId} />
      <button
        type="submit"
        className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-medium text-white"
      >
        Confirm Delete
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80"
      >
        Cancel
      </button>
    </form>
  );
}