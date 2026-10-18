import type { Metadata } from "next";
import { NewEventForm } from "./NewEventForm";

export const metadata: Metadata = { title: "Create an event" };

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="display text-[2.4rem] text-indigo">Create an event</h1>
      <p className="mt-2 text-ink-muted">
        You&apos;ll upload photos next, then get the invite link and QR code for your guests.
      </p>
      <NewEventForm />
    </div>
  );
}
