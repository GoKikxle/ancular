/**
 * An adire-inspired field of tied-and-dyed circles (oniko), drawn as a crowd.
 * One circle gets the gold ring: the guest the selfie just found.
 */

type Props = {
  cols?: number;
  rows?: number;
  found?: [number, number];
  className?: string;
  label?: string;
};

// Deterministic variation so server and client render the same pattern.
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function AdirePattern({ cols = 9, rows = 7, found = [6, 3], className, label }: Props) {
  const cell = 40;
  const width = cols * cell;
  const height = rows * cell;
  const motifs = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const cx = c * cell + cell / 2 + (r % 2 ? cell / 4 : -cell / 4) * 0.4;
      const cy = r * cell + cell / 2;
      const v = rand(i + 1);
      const isFound = c === found[0] && r === found[1];
      const opacity = isFound ? 1 : 0.28 + v * 0.5;
      motifs.push(
        <g key={i} opacity={opacity}>
          <circle cx={cx} cy={cy} r={11 + v * 3} fill="none" stroke="#fff" strokeWidth={1.4} strokeDasharray={v > 0.6 ? "2 3" : undefined} />
          <circle cx={cx} cy={cy} r={5.5 + v * 1.5} fill="#fff" />
          {v > 0.75 && <circle cx={cx} cy={cy} r={2} fill="var(--indigo)" />}
        </g>
      );
      if (isFound) {
        motifs.push(
          <circle
            key="found"
            className="found-ring"
            cx={cx}
            cy={cy}
            r={18}
            fill="none"
            stroke="var(--gold)"
            strokeWidth={3.5}
          />
        );
      }
    }
  }

  // Stitch lines between rows, like the resist lines in adire eleko.
  const stitches = [];
  for (let r = 1; r < rows; r++) {
    stitches.push(
      <line
        key={`s${r}`}
        x1={0}
        y1={r * cell}
        x2={width}
        y2={r * cell}
        stroke="#fff"
        strokeOpacity={0.12}
        strokeWidth={1}
        strokeDasharray="6 5"
      />
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      preserveAspectRatio="xMidYMid slice"
    >
      {stitches}
      {motifs}
    </svg>
  );
}
