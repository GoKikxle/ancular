import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Suspense } from "react";
import { CookieConsent } from "@/components/consent/CookieConsent";
import { OptionalAnalytics } from "@/components/consent/OptionalAnalytics";
import { VisitBeacon } from "@/components/analytics/VisitBeacon";
import { NavProgress } from "@/components/layout/NavProgress";

export const metadata: Metadata = {
  title: {
    default: "Ancular: find every photo of you with one selfie",
    template: "%s · Ancular",
  },
  description:
    "Private, invite-only photo sharing for festivals, conferences, weddings and community gatherings. Guests take one selfie and get every photo they appear in.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Ancular",
    title: "Ancular: every photo of you, found with one selfie",
    description: "Private photo sharing for festivals, conferences, weddings and community gatherings.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ancular: every photo of you, found with one selfie",
    description: "Private photo sharing for festivals, conferences, weddings and community gatherings.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>
        <Suspense fallback={null}>
          <NavProgress />
        </Suspense>
        {children}
        <CookieConsent />
        <OptionalAnalytics />
        <Suspense fallback={null}>
          <VisitBeacon />
        </Suspense>
      </body>
    </html>
  );
}
