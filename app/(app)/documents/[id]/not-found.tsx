import Link from "next/link";

export default function DocumentNotFound() {
  return (
    <main className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0a] text-white">
      <div
        className="flex flex-1 flex-col items-center justify-center px-8 pb-8 pt-[calc(2rem+var(--safe-area-top))]"
        style={{ paddingBottom: "max(2rem, var(--safe-area-bottom))" }}
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white/35"
            aria-hidden
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6M10 13h4M10 17h4M10 9h1" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-center text-[20px] font-semibold tracking-[-0.02em] text-white/90">
          Document not found
        </h1>
        <p className="mt-2 max-w-[280px] text-center text-[14px] leading-relaxed text-white/40">
          This file may have been removed or you don&apos;t have access.
        </p>
        <Link
          href="/documents"
          className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-[15px] font-semibold text-neutral-950 transition-opacity active:opacity-90"
        >
          Back to documents
        </Link>
      </div>
    </main>
  );
}
