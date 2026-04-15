"use client";

type MapPoint = {
  id: string;
  name: string;
  x: number;
  y: number;
  active?: boolean;
};

type TravelMapProps = {
  points: MapPoint[];
};

export default function TravelMap({ points }: TravelMapProps) {
  return (
    <div className="rounded-[28px] border border-neutral-200 bg-[#F8F8F6] p-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-[20px]">
        {/* SVG MAP (replace path with your country if needed) */}
        <svg
          viewBox="0 0 500 500"
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M80 200 L150 180 L200 220 L260 210 L320 240 L360 220 L400 260 L380 300 L320 320 L260 300 L200 320 L140 300 L100 260 Z"
            fill="#ECECEC"
            stroke="#D7D7D7"
            strokeWidth="1.2"
          />
        </svg>

        {/* MARKERS */}
        {points.map((point) => (
          <div
            key={point.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            {point.active ? (
              <ActiveMarker label={point.name} />
            ) : (
              <InactiveMarker />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InactiveMarker() {
  return <div className="h-2.5 w-2.5 rounded-full bg-[#228BE6]" />;
}

function ActiveMarker({ label }: { label: string }) {
  return (
    <div className="relative">
      {/* soft glow */}
      <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#228BE6]/15" />

      {/* core dot */}
      <div className="relative h-3 w-3 rounded-full bg-[#228BE6]" />

      {/* label */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-[#228BE6] px-4 py-2 text-sm font-medium text-white shadow-md">
        {label}
      </div>
    </div>
  );
}
