/** A QR-style invite code, drawn as pixels, for the "share one link" step. */
export function QrArt() {
  const N = 21;
  const finder = (x: number, y: number) => {
    for (const [fx, fy] of [
      [0, 0],
      [N - 7, 0],
      [0, N - 7],
    ]) {
      const dx = x - fx;
      const dy = y - fy;
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) {
        const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        return ring === 3 || ring <= 1 ? 1 : 0;
      }
      if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) return 0;
    }
    return null;
  };
  const cells: number[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++)
      cells.push(finder(x, y) ?? ((x * 7 + y * 13 + x * y) % 5 < 2 ? 1 : 0));
  return (
    <div className="qr-art" aria-hidden="true">
      <svg viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges">
        {cells.map((c, i) =>
          c ? (
            <rect
              key={i}
              x={i % N}
              y={Math.floor(i / N)}
              width="1"
              height="1"
            />
          ) : null,
        )}
      </svg>
      <span className="qr-link">
        <span className="opacity-50">ancular.com/e/</span>your-event
      </span>
    </div>
  );
}
