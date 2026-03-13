import { trips } from "@/data/trips";

export function getTripBySlug(slug: string) {
  return trips.find((trip) => trip.slug === slug);
}