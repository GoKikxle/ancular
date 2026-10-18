"use client";

import { useActionState } from "react";
import { joinEvent, type JoinState } from "@/app/e/[code]/actions";

export function JoinForm({ code, defaultName }: { code: string; defaultName: string }) {
  const [state, action, pending] = useActionState<JoinState, FormData>(joinEvent.bind(null, code), undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="display_name" className="label">
          Your name
        </label>
        <input
          id="display_name"
          name="display_name"
          className="field"
          defaultValue={defaultName}
          autoComplete="name"
          maxLength={80}
          required
        />
      </div>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Joining…" : "Join event"}
      </button>
    </form>
  );
}
