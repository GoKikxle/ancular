import { screenEyebrowLight } from "@/lib/screen-styles";
import TravelMapCard, { type TravelMapPoint } from "@/components/TravelMapCard";

export type { TravelMapPoint };

export type TravelMapHeading = {
  eyebrow: string;
  title: string;
  titleId?: string;
};

type TravelMapProps = {
  points: TravelMapPoint[];
  heading?: TravelMapHeading;
  className?: string;
};

export default function TravelMap({ points, heading, className = "" }: TravelMapProps) {
  const titleId = heading?.titleId ?? "travel-map-heading";

  const body = (
    <>
      {heading ? (
        <header className="mb-4">
          <p className={screenEyebrowLight}>{heading.eyebrow}</p>
          <h2
            id={titleId}
            className="mt-1 text-[18px] font-bold tracking-[-0.02em] text-[#111111] dark:text-white"
          >
            {heading.title}
          </h2>
        </header>
      ) : null}

      <div className="rounded-2xl border border-[#EBEBEB] bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:border-white/[0.1] dark:bg-white/[0.05] dark:shadow-none sm:p-4">
        <TravelMapCard points={points} />
      </div>
    </>
  );

  if (heading) {
    return (
      <section className={className} aria-labelledby={titleId}>
        {body}
      </section>
    );
  }

  return <div className={className}>{body}</div>;
}
