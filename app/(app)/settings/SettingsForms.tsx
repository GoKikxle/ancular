"use client";

import { useActionState } from "react";
import { clearSearchData, deleteAccount, updateProfile, type SettingsState } from "./actions";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateProfile, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="name" className="label">
          Name
        </label>
        <input id="name" name="name" className="field" defaultValue={name} required maxLength={80} autoComplete="name" />
      </div>
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="field"
          defaultValue={email}
          required
          maxLength={200}
          autoComplete="email"
        />
      </div>
      <Notice state={state} />
      <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

export function ClearSearchForm() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(clearSearchData, undefined);
  return (
    <form action={action} className="space-y-4">
      <p className="t-item-sub">
        Your selfie is never stored. This withdraws consent and removes the list of photos Ancular matched to you. The
        host&apos;s photos stay.
      </p>
      <Notice state={state} />
      <button type="submit" className="btn btn-quiet btn-lg" disabled={pending}>
        {pending ? "Clearing…" : "Clear my search data"}
      </button>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(deleteAccount, undefined);
  return (
    <form action={action} className="space-y-4">
      <p className="t-item-sub">
        This deletes your account, your memberships, and any events you created, including their photos. Type{" "}
        <span className="font-semibold text-ink">delete my account</span> to confirm.
      </p>
      <input name="confirm" className="field" autoComplete="off" placeholder="delete my account" />
      <Notice state={state} />
      <button type="submit" className="btn btn-danger btn-lg" disabled={pending}>
        {pending ? "Deleting…" : "Delete account"}
      </button>
    </form>
  );
}

function Notice({ state }: { state: SettingsState }) {
  if (state?.error) {
    return (
      <p role="alert" className="t-ui rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
        {state.error}
      </p>
    );
  }
  if (state?.saved) {
    return <p role="status" className="t-ui rounded-[4px] bg-fill px-3 py-2.5">{state.saved}</p>;
  }
  return null;
}
