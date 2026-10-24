import type { Metadata } from "next";
import { NewEventForm } from "./NewEventForm";

export const metadata: Metadata = { title: "Create an event" };

export default function NewEventPage() {
  return (
    <div className="max-w-xl">
      <h1 className="display">Create an event</h1>
      <p className="t-lead t-muted mt-5">
        You&apos;ll upload photos next, then get the invite link and QR code for your guests.
      </p>
      <NewEventForm />
    </div>
  );
}
