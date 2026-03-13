type NextActionCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
};

export function NextActionCard({
  title,
  description,
  buttonLabel,
}: NextActionCardProps) {
  return (
    <section className="mb-4 rounded-3xl bg-sky-500 px-4 py-5 text-slate-950">
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
        Next Action
      </p>

      <h3 className="mt-2 text-2xl font-semibold">{title}</h3>

      <p className="mt-2 text-sm opacity-80">{description}</p>

      <button className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
        {buttonLabel}
      </button>
    </section>
  );
}