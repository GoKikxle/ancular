import { redirect } from "next/navigation";

// The trips list now lives at `/`. Redirect for any direct visits.
export default function TripsPage() {
  redirect("/");
}
