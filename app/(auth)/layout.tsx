import { AdirePattern } from "@/components/brand/AdirePattern";
import { Logo } from "@/components/brand/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh md:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-indigo md:block">
        <div className="absolute left-8 top-6 z-10">
          <Logo onIndigo />
        </div>
        <AdirePattern className="absolute inset-0 h-full w-full" cols={8} rows={12} found={[5, 6]} />
      </aside>
      <main className="flex flex-col px-4 py-6 sm:px-8">
        <div className="md:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
