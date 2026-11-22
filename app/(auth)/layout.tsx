import { MarketingFooter } from "@/components/landing/MarketingFooter";
import { MarketingHeader } from "@/components/landing/MarketingHeader";

/** Sign in, sign up and confirm email, dressed like the public pages. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp lp-auth">
      <MarketingHeader base="/" cta={false} />
      <main className="lp-wrap pb-24 pt-12 md:pb-32 md:pt-20">
        <div className="mx-auto max-w-[440px]">{children}</div>
      </main>
      <MarketingFooter />
    </div>
  );
}
