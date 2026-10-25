import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ancular: find every photo of you with one selfie",
    template: "%s · Ancular",
  },
  description:
    "Private, invite-only photo sharing for weddings, church services and parties. Guests take one selfie and get every photo they appear in.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Ancular",
    description: "Find every photo of you from the event with one selfie.",
    siteName: "Ancular",
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
      <body>{children}</body>
    </html>
  );
}
