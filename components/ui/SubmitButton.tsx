"use client";

import { useFormStatus } from "react-dom";

/**
 * A form's submit button that shows it's working: busy label, dimmed, and can't be
 * pressed twice while the server answers.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className = "btn btn-quiet",
  ...rest
}: {
  children: React.ReactNode;
  pendingLabel?: React.ReactNode;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children">) {
  const { pending } = useFormStatus();
  return (
    <button {...rest} type="submit" className={className} disabled={pending || rest.disabled} aria-busy={pending || undefined}>
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
