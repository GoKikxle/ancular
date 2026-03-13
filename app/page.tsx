export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            Ancular
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Everything about your trip in one place.
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/70">
            A mobile-first travel command center for tickets, documents,
            reminders, weather, and what to do next.
          </p>
        </header>

        <section className="mb-4 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/50">
                Current Trip
              </p>
              <h2 className="text-xl font-semibold">Barcelona Getaway</h2>
            </div>

            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
              Active
            </span>
          </div>

          <p className="text-sm text-white/70">Apr 12 → Apr 18 • 2 travelers</p>
        </section>

        <section className="mb-4 rounded-3xl bg-sky-500 px-4 py-5 text-slate-950">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
            Next Action
          </p>

          <h3 className="mt-2 text-2xl font-semibold">
            Leave for airport at 4:30 PM
          </h3>

          <p className="mt-2 text-sm opacity-80">
            International flight check-in closes 1 hour before departure.
          </p>

          <button className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
            View Timeline
          </button>
        </section>

        <section className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">
              Documents
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>• Flight ticket</li>
              <li>• Hotel confirmation</li>
              <li>• Passport copy</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">
              Weather
            </p>
            <h3 className="mt-2 text-2xl font-semibold">22°C Sunny</h3>
            <p className="mt-1 text-sm text-white/70">
              Great weather for walking and outdoor dining.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">
              Nearby
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>• Brunch spot 6 min away</li>
              <li>• Pharmacy 4 min away</li>
              <li>• Beach entrance 12 min away</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}