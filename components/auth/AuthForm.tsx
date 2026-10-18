"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

type Props = {
  mode: Mode;
  /** Where to go after signing in, e.g. an invite page */
  next: string;
  initialError?: string;
};

function safeNext(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export function AuthForm({ mode, next, initialError }: Props) {
  const isLogin = mode === "login";
  const destination = safeNext(next);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const callbackUrl = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isLogin && !isAdult) {
      setError("Ancular accounts are for adults. Ask a parent or guardian to search for you.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error: err } = await createClient().auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else {
        const { data, error: err } = await createClient().auth.signUp({
          email,
          password,
          options: { emailRedirectTo: callbackUrl(), data: { full_name: name.trim() } },
        });
        if (err) throw err;
        if (!data.session) {
          setSentTo(email);
          setLoading(false);
          return;
        }
      }
      window.location.href = destination;
    } catch (err) {
      setError(err instanceof Error ? friendly(err.message) : "Something went wrong. Try again.");
      setLoading(false);
    }
  }

  async function handleEmailLink() {
    setError(null);
    if (!email) {
      setError("Enter your email address first.");
      return;
    }
    setLoading(true);
    const { error: err } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl() },
    });
    setLoading(false);
    if (err) {
      setError(friendly(err.message));
      return;
    }
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <div className="rounded-2xl bg-paper p-6 text-center shadow-[0_0_0_1.5px_var(--line)]">
        <h2 className="text-xl font-bold">Check your email</h2>
        <p className="mt-2 text-ink-muted">
          We sent a sign-in link to <strong className="text-ink">{sentTo}</strong>. Open it on this phone to continue.
        </p>
        <p className="mt-3 text-sm text-ink-muted">Not there after a minute? Check spam or promotions.</p>
        <button type="button" onClick={() => setSentTo(null)} className="btn btn-quiet btn-sm mt-5">
          Use a different email
        </button>
      </div>
    );
  }

  const switchHref = `${isLogin ? "/signup" : "/login"}${next ? `?next=${encodeURIComponent(destination)}` : ""}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {!isLogin && (
        <div>
          <label htmlFor="name" className="label">
            Your name
          </label>
          <input
            id="name"
            className="field"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adaeze Okafor"
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          className="field"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="field"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {!isLogin && <p className="hint mt-1">At least 8 characters.</p>}
      </div>

      {!isLogin && (
        <label className="flex items-start gap-3 text-[0.95rem]">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 accent-[var(--indigo)]"
            checked={isAdult}
            onChange={(e) => setIsAdult(e.target.checked)}
          />
          <span>I&apos;m 18 or older</span>
        </label>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-[0.95rem] text-danger">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "One moment…" : isLogin ? "Sign in" : "Create account"}
      </button>

      {isLogin && (
        <button type="button" className="btn btn-quiet w-full" onClick={handleEmailLink} disabled={loading}>
          Email me a sign-in link instead
        </button>
      )}

      <p className="pt-2 text-center text-[0.95rem] text-ink-muted">
        {isLogin ? "New to Ancular? " : "Already have an account? "}
        <Link href={switchHref} className="font-semibold text-indigo underline underline-offset-4">
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}

function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match. Try again or use a sign-in link.";
  if (m.includes("already registered")) return "There's already an account with this email. Sign in instead.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Wait a minute and try again.";
  if (m.includes("password")) return message;
  return message;
}
