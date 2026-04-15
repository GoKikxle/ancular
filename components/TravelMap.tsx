import { screenEyebrowLight } from "@/lib/screen-styles";

export type TravelMapHeading = {
  eyebrow: string;
  title: string;
  titleId?: string;
};

type TravelMapProps = {
  heading?: TravelMapHeading;
  className?: string;
};

export default function TravelMap({ heading, className = "" }: TravelMapProps) {
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

      <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:border-white/[0.1] dark:bg-white/[0.05] dark:shadow-none sm:p-7">
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center sm:py-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-600 dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <p className="max-w-[260px] text-[14px] font-medium leading-snug text-[#111111] dark:text-white/85">
            Travel map coming soon
          </p>
          <p className="max-w-[280px] text-[13px] leading-relaxed text-[#9A9A9A] dark:text-white/45">
            We’re preparing an interactive map for your destinations. Your stats below stay up to date.
          </p>
        </div>
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
