"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

type AuthFormProps = {
  mode: Mode;
  /** Canonical site URL for auth redirects (from getURL()). Never use window.location in production. */
  redirectUrl: string;
  /** Pre-set error (e.g. from ?error=auth_callback_error on login page) */
  initialError?: string;
};

export function AuthForm({ mode, redirectUrl, initialError }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const supabase = createClient();

  const isLogin = mode === "login";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (err) throw err;
        // If email confirmation is required, session may be null
        if (!data.session) {
          setError(null);
          setMagicLinkSent(true);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
      return;
    }

    setLoading(false);
    window.location.href = "/";
  }

  const RATE_LIMIT_MESSAGE =
    "Too many email login attempts. Please wait a minute and try again, or use password login.";

  function isRateLimitError(err: unknown): boolean {
    const authErr = err as { status?: number; code?: string };
    return (
      authErr?.status === 429 ||
      (typeof authErr?.code === "string" &&
        authErr.code.toLowerCase().includes("rate_limit"))
    );
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectUrl },
      });
      if (err) throw err;
      setMagicLinkSent(true);
    } catch (err) {
      setError(
        isRateLimitError(err) ? RATE_LIMIT_MESSAGE : err instanceof Error ? err.message : "Something went wrong"
      );
    }

    setLoading(false);
  }

  if (magicLinkSent) {
    return (
      <div className="rounded-[16px] border border-[#EBEBEB] bg-white p-6 text-center shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
        <p className="text-[16px] font-semibold text-[#111111] dark:text-white/90">
          Check your inbox
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-[#9A9A9A] dark:text-white/50">
          We sent a magic link to{" "}
          <span className="font-medium text-[#111111] dark:text-white/70">{email}</span>
        </p>
        <p className="mt-3 text-[13px] text-[#9A9A9A] dark:text-white/35">
          Check your spam folder if you don’t see it.
        </p>
        <button
          type="button"
          onClick={() => setMagicLinkSent(false)}
          className="mt-5 text-[14px] font-medium text-[#111111] underline decoration-[#CFCFCF] underline-offset-4 transition-colors hover:text-[#000000] dark:text-white/50 dark:decoration-white/20 dark:hover:text-white/75"
        >
          Use password instead
        </button>
      </div>
    );
  }

  const fieldClass =
    "mt-2 w-full min-h-[48px] rounded-2xl border border-[#EBEBEB] bg-white px-4 py-3.5 text-[16px] leading-normal text-[#111111] placeholder:text-[#9A9A9A] transition-colors focus:border-[#CFCFCF] focus:outline-none focus:ring-2 focus:ring-[#111111]/[0.08] disabled:opacity-50 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/10";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="space-y-0">
        <label
          htmlFor="email"
          className="block text-[13px] font-semibold text-[#3D3D3D] dark:text-white/50"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          disabled={loading}
          className={fieldClass}
        />
      </div>

      <div className="space-y-0">
        <label
          htmlFor="password"
          className="block text-[13px] font-semibold text-[#3D3D3D] dark:text-white/50"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required={isLogin}
          minLength={isLogin ? undefined : 6}
          autoComplete={isLogin ? "current-password" : "new-password"}
          disabled={loading}
          className={fieldClass}
        />
      </div>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] leading-snug text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 pt-0.5">
        <button
          type="submit"
          disabled={loading}
          className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-[#111111] px-4 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-[#222222] disabled:opacity-50 active:scale-[0.99] dark:bg-white dark:text-neutral-950 dark:hover:bg-white/90"
        >
          {loading
            ? "Please wait…"
            : isLogin
              ? "Log in"
              : "Create account"}
        </button>

        {isLogin && (
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={loading || !email}
            className="flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-[#EBEBEB] bg-white px-4 py-3.5 text-[15px] font-semibold text-[#111111] shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-colors hover:border-[#D6D6D6] hover:bg-[#FAFAFA] disabled:opacity-50 active:scale-[0.99] dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-white/85 dark:shadow-none dark:hover:bg-white/[0.07]"
          >
            Continue with Magic Link
          </button>
        )}
      </div>

      <p className="pt-1 text-center text-[14px] leading-relaxed text-[#9A9A9A] dark:text-white/40">
        {isLogin ? (
          <>
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#111111] underline decoration-[#D6D6D6] underline-offset-[3px] transition-colors hover:decoration-[#111111] dark:text-white/75 dark:decoration-white/25 dark:hover:text-white"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#111111] underline decoration-[#D6D6D6] underline-offset-[3px] transition-colors hover:decoration-[#111111] dark:text-white/75 dark:decoration-white/25 dark:hover:text-white"
            >
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
