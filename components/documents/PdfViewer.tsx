"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

/**
 * PDF.js worker — version must match the `pdfjs` instance bundled with `react-pdf`.
 * CDN keeps Next/Turbopack from having to resolve the worker chunk path.
 */
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function Spinner() {
  return (
    <div
      className="h-9 w-9 animate-spin rounded-full border-2 border-white/[0.12] border-t-white/50"
      role="status"
      aria-label="Loading PDF"
    />
  );
}

type PdfViewerProps = {
  /** HTTPS / blob URL to the PDF bytes */
  fileSrc: string;
  /** Bump to force reload (retry) */
  loadKey: number;
  onReady?: () => void;
  onError?: () => void;
};

/**
 * Multi-page PDF: all pages stacked vertically in a scrollable, width-fitting layout.
 */
export function PdfViewer({ fileSrc, loadKey, onReady, onError }: PdfViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState<number>(() =>
    typeof window !== "undefined" ? Math.min(window.innerWidth - 40, 560) : 340
  );
  const [numPages, setNumPages] = useState(0);

  const measureWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const w = Math.floor(el.getBoundingClientRect().width);
    if (w > 24) setPageWidth(w - 16);
  }, []);

  useEffect(() => {
    measureWidth();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measureWidth());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureWidth]);

  const onLoadSuccess = useCallback(
    ({ numPages: n }: { numPages: number }) => {
      setNumPages(n);
      onReady?.();
    },
    [onReady]
  );

  const handleLoadError = useCallback(() => {
    onError?.();
  }, [onError]);

  return (
    <div
      ref={scrollRef}
      className="h-full min-h-0 w-full overflow-y-auto overscroll-contain px-2 pb-4 pt-2"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <Document
        key={loadKey}
        file={fileSrc}
        onLoadSuccess={onLoadSuccess}
        onLoadError={handleLoadError}
        loading={
          <div className="flex min-h-[40dvh] flex-col items-center justify-center gap-4 py-12">
            <Spinner />
            <p className="text-[13px] text-white/40">Loading PDF…</p>
          </div>
        }
        error={
          <div className="px-4 py-8 text-center text-[14px] text-white/45">Could not open this PDF.</div>
        }
        className="flex flex-col items-center gap-4"
      >
        {numPages > 0 &&
          Array.from({ length: numPages }, (_, i) => (
            <Page
              key={`${loadKey}-p-${i + 1}`}
              pageNumber={i + 1}
              width={pageWidth}
              className="!bg-white shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
              renderTextLayer
              renderAnnotationLayer
            />
          ))}
      </Document>
    </div>
  );
}
