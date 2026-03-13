import type { Trip } from "@/types/trip";
import { trips as seedTrips } from "@/data/trips";

// Temporary in-memory store seeded from static data.
// TODO: Replace all functions below with Supabase queries:
//   getTrips()     → supabase.from("trips").select("*")
//   addTrip()      → supabase.from("trips").insert(trip)
//   deleteTrip()   → supabase.from("trips").delete().eq("id", id)
//   getTripBySlug  → supabase.from("trips").select("*").eq("slug", slug).single()
// Note: module-level state persists within a single Node.js process (dev only).
// In production with multiple workers, each worker would have its own copy.

let store: Trip[] = [...seedTrips];

export function getTrips(): Trip[] {
  return store;
}

export function getTripBySlug(slug: string): Trip | undefined {
  return store.find((t) => t.slug === slug);
}

export function addTrip(trip: Trip): void {
  store = [...store, trip];
}

export function deleteTrip(id: string): void {
  store = store.filter((t) => t.id !== id);
}
