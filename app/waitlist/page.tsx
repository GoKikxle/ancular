import { redirect } from "next/navigation";

/** Waitlist is closed — Ancular is open to every host on Free. */
export default function WaitlistPage() {
  redirect("/signup");
}
