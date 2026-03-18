import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { getTrips } from "@/lib/trips";

export default async function Home() {
  const trips = await getTrips();

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <PageContainer>
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/50">Ancular</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Your Trips
            </h1>
          </div>

          <Link
            href="/trips/new"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.08]"
          >
            + Add Trip
          </Link>
        </header>

        <section className="space-y-4">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.slug}`}
              className="block rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{trip.title}</h2>
                  <p className="mt-1 text-sm text-white/70">
                    {trip.dates} • {trip.travelers}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    trip.status === "Active"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-white/10 text-white/70"
                  }`}
                >
                  {trip.status}
                </span>
              </div>

              <p className="mt-3 text-sm text-white/60">
                {trip.next_action_title}
              </p>
            </Link>
          ))}
        </section>
      </PageContainer>
    </main>
  );
}