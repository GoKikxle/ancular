"use client";

import { useAuth } from "@/components/providers/AuthProvider";

export function SignOutButton() {
  const { signOut } = useAuth();

  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="flex w-full items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-[15px] font-medium text-red-400/90 transition-colors hover:bg-red-500/10 active:scale-[0.99]"
    >
      Sign out
    </button>
  );
}
