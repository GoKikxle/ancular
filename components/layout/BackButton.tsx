"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  href?: string;
  label?: string;
};

export function BackButton({ href, label = "Back" }: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  }

  return (
    <button
      onClick={handleClick}
      className="mb-6 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white/90"
    >
      ← {label}
    </button>
  );
}
