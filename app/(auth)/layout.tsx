import { SiteHeader } from "@/components/layout/SiteHeader";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="container-page pb-16 pt-10 md:pt-20">
        <div className="max-w-md">{children}</div>
      </main>
    </div>
  );
}
