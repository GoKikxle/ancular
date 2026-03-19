import { AuthForm } from "@/components/auth/AuthForm";
import { getURL } from "@/lib/url";
import Link from "next/link";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const redirectUrl = "https://ancular.vercel.app/auth/callback";

  return (
    <div className="space-y-8">
      <header className="text-center">
        <Link href="/" className="text-[22px] font-semibold tracking-tight text-white">
          Ancular
        </Link>
        <h1 className="mt-6 text-[20px] font-medium text-white/90">
          Log in
        </h1>
        <p className="mt-1.5 text-[14px] text-white/45">
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
