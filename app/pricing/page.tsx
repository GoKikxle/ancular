import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { MarketingFooter } from "@/components/landing/MarketingFooter";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { Plans } from "@/components/pricing/Plans";
import { FaqList } from "@/components/marketing/FaqList";
import { PRICING_FAQS } from "@/components/marketing/faqs";
import { displayCurrencyForCountry } from "@/lib/plans";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Hosts pay for the event, never the guests. Start free, unlock one event, or go Pro.",
};

export default async function PricingPage() {
  const headerList = await headers();
  const country = headerList.get("x-vercel-ip-country");
  const currency = displayCurrencyForCountry(country);
  const { user } = await getUser();
  const signedIn = !!user;
  const billingOn = !!process.env.STRIPE_SECRET_KEY;

  return (
    <div className="lp">
      <MarketingHeader base="/" />
      <main>
        <section className="lp-wrap pb-20 pt-12 md:pb-28 md:pt-20">
          <div className="mx-auto max-w-[1040px]">
            <div className="text-center">
              <h1
                className="lp-display reveal-up mx-auto max-w-[14ch]"
                style={{ animationDelay: "60ms" }}
              >
                Pay for the event, never the guests.
              </h1>
              <p
                className="lp-lead reveal-up mx-auto mt-6 max-w-md"
                style={{ animationDelay: "120ms" }}
              >
                Start free. Unlock one event, or go Pro if you host often.
              </p>
            </div>
            <div
              className="reveal-up mt-12 md:mt-16"
              style={{ animationDelay: "160ms" }}
            >
              <Plans
                currency={currency}
                signedIn={signedIn}
                billingOn={billingOn}
              />
            </div>
            {!signedIn && (
              <p className="t-meta mt-8 text-center">
                No card needed for Free.{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-ink underline underline-offset-4"
                >
                  Create an account
                </Link>
              </p>
            )}
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 py-20 md:py-32">
          <div className="lp-wrap">
            <div className="mx-auto max-w-[768px]">
              <div className="text-center">
                <h2 className="lp-h2">Questions, answered.</h2>
              </div>
              <FaqList items={PRICING_FAQS} className="mt-12" />
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
