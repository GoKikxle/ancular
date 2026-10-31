/** Grey placeholder blocks shown while a page loads. */
export function Bar({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`skeleton block rounded-[4px] ${className}`} />;
}

export function PageSkeleton({ rows = 4, grid = false }: { rows?: number; grid?: boolean }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <Bar className="h-12 w-2/3 max-w-md md:h-16" />
      <Bar className="mt-5 h-4 w-48" />
      {grid ? (
        <ul aria-hidden="true" className="mt-12 columns-2 gap-2 sm:columns-3 md:columns-4 md:gap-4 lg:columns-5">
          {[5, 4, 6, 4, 5, 6, 4, 5, 6, 4].map((h, i) => (
            <li key={i} className="mb-2 break-inside-avoid md:mb-4">
              <span className="skeleton block rounded-[2px]" style={{ aspectRatio: `4 / ${h}` }} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-12 border-t border-hairline">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="border-b border-hairline py-4">
              <Bar className="h-4 w-56" />
              <Bar className="mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
