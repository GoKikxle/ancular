/**
 * Pure helpers — no DB calls.
 *
 * computeTripStatus  — derives "Active" | "Upcoming" | "Past" from date fields.
 * formatTripDates    — formats two ISO date strings into a human-readable range.
 */

/**
 * Computes the display status of a trip from its ISO date strings.
 *
 * Rules:
 *   today < start_date                  → "Upcoming"
 *   start_date ≤ today ≤ end_date       → "Active"
 *   today > end_date                    → "Past"
 *
 * If end_date is null (open-ended or one-way trip):
 *   before start_date  → "Upcoming"
 *   on/after start     → "Active"  (no end means no expiry)
 */
export function computeTripStatus(
  startDate: string,
  endDate: string | null
): "Active" | "Upcoming" | "Past" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [sy, sm, sd] = startDate.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd);

  if (today < start) return "Upcoming";

  if (endDate) {
    const [ey, em, ed] = endDate.split("-").map(Number);
    const end = new Date(ey, em - 1, ed);
    if (today > end) return "Past";
  }

  return "Active";
}

/**
 * Formats two "YYYY-MM-DD" date strings into a human-readable range.
 * Example: "Jun 10 → Jun 17, 2025"
 *
 * Parsing is done in local time to avoid UTC midnight timezone shifts
 * that can cause off-by-one-day errors with `new Date("YYYY-MM-DD")`.
 */
export function formatTripDates(start: string, end: string | null): string {
  const parse = (d: string) => {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day);
  };

  const startFmt = parse(start).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (!end) return startFmt;

  const endFmt = parse(end).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startFmt} → ${endFmt}`;
}
