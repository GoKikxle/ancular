import { AuthForm } from "@/components/auth/AuthForm";
import Link from "next/link";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const redirectUrl = "https://ancular.vercel.app/auth/callback";

  return (
    <div className="flex w-full flex-col gap-9 pb-2 pt-1">
      <header className="text-center">
        <Link
          href="/"
          className="inline-block text-[22px] font-semibold tracking-[-0.02em] text-[#111111] transition-opacity hover:opacity-80 dark:text-white"
        >
          Ancular
        </Link>
        <h1 className="mt-7 text-[22px] font-bold tracking-[-0.02em] text-[#111111] dark:text-white">
          Log in
        </h1>
        <p className="mt-2 max-w-[280px] mx-auto text-[15px] leading-snug text-[#9A9A9A] dark:text-white/45">
          Sign in to your account
        </p>
      </header>

      <AuthForm
        mode="login"
        redirectUrl={redirectUrl}
        initialError={
          error === "auth_callback_error"
            ? "Login link expired or invalid. Please try again."
            : undefined
        }
      />
    </div>
  );
}
