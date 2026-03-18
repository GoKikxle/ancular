"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { AvatarPicker } from "./AvatarPicker";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { updateProfileAction } from "@/app/(app)/settings/actions";

type ProfileFormProps = {
  fullName: string | null;
  avatarId: string | null;
  email: string;
};

export function ProfileForm({
  fullName,
  avatarId,
  email,
}: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(fullName ?? "");
  const [avatar, setAvatar] = useState(avatarId ?? "avatar_1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("full_name", name);
    formData.set("avatar_id", avatar);

    const result = await updateProfileAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Large avatar preview */}
      <div className="flex justify-center">
        <UserAvatar avatarId={avatar} size="large" />
      </div>

      {/* Full name */}
      <div>
        <label
          htmlFor="full_name"
          className="block text-[12px] font-medium text-white/40"
        >
          Display name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          disabled={loading}
          className="mt-1.5 w-full rounded-2xl border border-white/[0.1] bg-white/[0.05] px-4 py-3.5 text-[15px] text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 disabled:opacity-50"
        />
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="block text-[12px] font-medium text-white/40">
          Email
        </label>
        <p className="mt-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-[15px] text-white/70">
          {email}
        </p>
      </div>

      {/* Avatar picker */}
      <div>
        <label className="block text-[12px] font-medium text-white/40">
          Avatar
        </label>
        <input type="hidden" name="avatar_id" value={avatar} />
        <div className="mt-3">
          <AvatarPicker selectedId={avatar} onSelect={(id) => setAvatar(id)} />
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
          {error}
        </p>
      )}

      {/* Save button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-white py-4 text-[15px] font-semibold text-neutral-950 transition-opacity hover:opacity-95 disabled:opacity-50 active:scale-[0.99]"
      >
        {loading ? "Saving…" : "Save"}
      </button>

      {/* Sign out */}
      <div className="border-t border-white/[0.06] pt-6">
        <SignOutButton />
      </div>
    </form>
  );
}
