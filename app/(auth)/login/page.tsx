import { AuthForm } from "@/components/auth/AuthForm";
import Link from "next/link";

export default function LoginPage() {
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

      <AuthForm mode="login" />
    </div>
  );
}
