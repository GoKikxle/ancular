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
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6 text-center">
        <p className="text-[15px] font-medium text-white/90">
          Check your inbox
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-white/50">
          We sent a magic link to <span className="text-white/70">{email}</span>
        </p>
        <p className="mt-3 text-[12px] text-white/35">
          Check your spam folder if you don’t see it.
        </p>
        <button
          type="button"
          onClick={() => setMagicLinkSent(false)}
          className="mt-5 text-[13px] text-white/40 underline hover:text-white/60"
        >
          Use password instead
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-[12px] font-medium text-white/40"
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
          className="mt-1.5 w-full rounded-2xl border border-white/[0.1] bg-white/[0.05] px-4 py-3.5 text-[15px] text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 disabled:opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-[12px] font-medium text-white/40"
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
          className="mt-1.5 w-full rounded-2xl border border-white/[0.1] bg-white/[0.05] px-4 py-3.5 text-[15px] text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 disabled:opacity-50"
        />
      </div>

      {error && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-white py-4 text-[15px] font-semibold text-neutral-950 transition-opacity hover:opacity-95 disabled:opacity-50 active:scale-[0.99]"
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
          className="w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] py-3.5 text-[14px] font-medium text-white/70 transition-colors hover:bg-white/[0.07] hover:text-white/90 disabled:opacity-50 active:scale-[0.99]"
        >
          Continue with Magic Link
        </button>
      )}

      <p className="pt-2 text-center text-[13px] text-white/40">
        {isLogin ? (
          <>
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-white/60 underline hover:text-white/80"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-white/60 underline hover:text-white/80"
            >
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
