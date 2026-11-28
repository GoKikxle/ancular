import Link from "next/link";
import { dismissProfileBanner } from "@/app/(app)/profile/actions";
import type { ProfileSteps } from "@/lib/org-profile";

/** Dashboard nudge to finish the organisation profile. Hidden once done or dismissed. */
export function ProfileBanner({ steps }: { steps: ProfileSteps }) {
  const todo = [
    !steps.details && "add your name and website",
    !steps.logo && "upload your logo",
    !steps.verification && "get verified",
  ].filter(Boolean) as string[];
  const list = todo.length > 1 ? `${todo.slice(0, -1).join(", ")} and ${todo.at(-1)}` : todo[0];
  return (
    <div className="pb-banner">
      <div className="min-w-0">
        <p className="t-meta">
          {steps.done} of {steps.total} done
        </p>
        <p className="t-item mt-1">Complete your organisation profile</p>
        <p className="t-item-sub mt-1">
          So guests know your links are really from you: {list}.
        </p>
        <div className="pb-meter" aria-hidden="true">
          <span style={{ width: `${(steps.done / steps.total) * 100}%` }} />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link href="/profile" className="btn btn-primary btn-sm">
          Complete profile
        </Link>
        <form action={dismissProfileBanner}>
          <button type="submit" className="btn btn-quiet btn-sm">
            Not now
          </button>
        </form>
      </div>
    </div>
  );
}
