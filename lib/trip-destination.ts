/**
 * Pure helpers for destination-based trip context.
 * No DB calls — used by weather card and suggestion engine.
 */

/**
 * Three states the weather card can be in, driven by destination quality.
 *
 *   missing  — destination field is empty or null.
 *              Show: "Add a destination to enable weather and trip insights"
 *
 *   weak     — destination is too short or too generic to be meaningful
 *              (e.g. "trip", "home", "abroad", single characters).
 *              Show: "Add a more specific destination (e.g. Barcelona, Spain)…"
 *
 *   valid    — destination looks like a real place name.
 *              Show: weather data if available, otherwise a named placeholder.
 */
export type DestinationStrength = "missing" | "weak" | "valid";

/** Words that look like destinations but carry no geographic meaning. */
const GENERIC_DESTINATIONS = new Set([
  "trip",
  "travel",
  "travelling",
  "traveling",
  "vacation",
  "holiday",
  "home",
  "abroad",
  "away",
  "somewhere",
  "journey",
  "tour",
  "adventure",
  "retreat",
  "getaway",
  "my trip",
  "our trip",
  "a trip",
  "the trip",
  "work trip",
  "business trip",
  "city break",
]);

/**
 * Classifies how useful a destination string is for weather lookups.
 *
 * Rules:
 *   1. Null / empty                 → "missing"
 *   2. Fewer than 3 characters      → "weak"
 *   3. In the generic words list    → "weak"
 *   4. Everything else              → "valid"
 */
export function classifyDestination(
  destination: string | null | undefined
): DestinationStrength {
  if (!destination || destination.trim().length === 0) return "missing";

  const normalized = destination.trim().toLowerCase();

  if (normalized.length < 3) return "weak";
  if (GENERIC_DESTINATIONS.has(normalized)) return "weak";

  return "valid";
}
