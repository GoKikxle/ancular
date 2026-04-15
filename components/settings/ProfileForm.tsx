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

    try {
      const formData = new FormData();
      formData.set("full_name", name);
      formData.set("avatar_id", avatar);

      const result = await updateProfileAction(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pt-6">
      {/* Large avatar preview */}
      <div className="flex justify-center">
        <UserAvatar avatarId={avatar} size="large" />
      </div>

      {/* Full name */}
      <div>
        <label
          htmlFor="full_name"
          className="block text-[12px] font-medium text-[#888888] dark:text-white/40"
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
          className="mt-1.5 w-full rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3.5 text-[15px] text-[#111111] placeholder:text-[#BBBBBB] focus:border-[#D0D0D0] focus:outline-none disabled:opacity-50 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20"
        />
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="block text-[12px] font-medium text-[#888888] dark:text-white/40">
          Email
        </label>
        <p className="mt-1.5 rounded-2xl border border-[#EBEBEB] bg-[#F5F5F5] px-4 py-3.5 text-[15px] text-[#666666] dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/70">
          {email}
        </p>
      </div>

      {/* Avatar picker */}
      <div>
        <label className="block text-[12px] font-medium text-[#888888] dark:text-white/40">
          Avatar
        </label>
        <input type="hidden" name="avatar_id" value={avatar} />
        <div className="mt-3">
          <AvatarPicker selectedId={avatar} onSelect={(id) => setAvatar(id)} />
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-500 dark:text-red-300">
          {error}
        </p>
      )}

      {/* Save button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-[#111111] py-4 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 active:scale-[0.99] dark:bg-white dark:text-neutral-950 dark:hover:opacity-95"
      >
        {loading ? "Saving…" : "Save"}
      </button>

      {/* Sign out */}
      <div className="border-t border-[#EBEBEB] pt-6 dark:border-white/[0.06]">
        <SignOutButton />
      </div>
    </form>
  );
}
