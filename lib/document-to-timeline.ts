/**
 * Document → Timeline Auto-Creation
 *
 * Converts document metadata (category + title) into structured timeline item
 * templates that are inserted automatically when a document is uploaded or attached.
 *
 * ── Architecture boundary ───────────────────────────────────────────────────────
 * `generateTimelineItemsFromDocument` is the single integration point for future
 * intelligence. To upgrade from rule-based → AI/OCR:
 *   1. Accept a `fileContent: string` (extracted text) alongside the metadata.
 *   2. Pass it to an LLM/OCR extractor that returns date, time, route, reference.
 *   3. Populate `event_date` and `time` from the extracted values instead of
 *      the trip-date fallbacks used here.
 *
 * All callers (`insertDocumentTimelineItems`, server actions) stay unchanged.
 *
 * ── Date assignment strategy ────────────────────────────────────────────────────
 *
 *   flight      → trip start date    (departure day)
 *   hotel c/in  → trip start date    (check-in on arrival day)
 *   hotel c/out → trip end date      (check-out on last day)
 *                 fallback: start + 1 day when no end_date
 *   booking     → trip start date    (most bookings fall in the first/only day)
 *   identity    → no items
 *   other       → no items
 *
 * When no tripContext is supplied all event_date values are null, which sorts
 * those items after explicitly-dated rows (NULLS LAST). The user can correct
 * the date via the inline edit form on the trip page.
 *
 * ── Supported categories ───────────────────────────────────────────────────────
 *   flight   → 1 item  (departure action, 09:00 placeholder)
 *   hotel    → 2 items (check-in at 15:00, check-out at 11:00)
 *   booking  → 1 item  (classified reservation at 12:00)
 *   identity → 0 items
 *   other    → 0 items
 */

import type { DocumentCategory } from "@/types/document";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type DocumentGeneratedItem = {
  /** Timeline item title — travel-specific, derived from document metadata. */
  title: string;

  /**
   * ISO date "YYYY-MM-DD" derived from trip context, or null if no reliable
   * date can be assigned (e.g. no tripContext provided, or trip has no dates).
   *
   * Null items sort after dated items (NULLS LAST in getTimelineItemsForTrip)
   * so they don't pollute the chronological view; the user can edit them later.
   */
  event_date: string | null;

  /**
   * Placeholder 24-hour time ("HH:MM"). Sensible per category.
   * Future: replace with AI-extracted time from file content.
   */
  time: string;

  /**
   * Contextual note with source attribution and a prompt to confirm the date/time.
   * Future: replace with extracted route, reference number, or gate info.
   */
  note: string;

  /**
   * Matches the `action_type` pill values in AddActionForm.
   * TODO: store directly once `action_type TEXT NULL` column exists:
   *   ALTER TABLE timeline_items ADD COLUMN IF NOT EXISTS action_type TEXT NULL;
   */
  actionType: "flight" | "hotel" | "activity" | "train" | "restaurant" | "other";
};

/**
 * Optional trip date context passed to the generator.
 * Both fields are ISO date strings "YYYY-MM-DD".
 */
export type TripDateContext = {
  startDate?: string | null;
  endDate?: string | null;
};

// ─── String helpers ────────────────────────────────────────────────────────────

/** Capitalises the first letter of a string. */
function cap(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Strips file extensions and replaces separators with spaces. */
function cleanDocTitle(raw: string): string {
  return (raw ?? "")
    .replace(/\.[a-z]{2,5}$/i, "")   // remove .pdf, .jpg etc.
    .replace(/[-_]+/g, " ")           // dashes/underscores → spaces
    .replace(/\s{2,}/g, " ")
    .trim();
}

function noteFor(docTitle: string, hint: string): string {
  return `From "${docTitle}" · ${hint}`;
}

/**
 * Adds `n` days to an ISO date string and returns the result.
 * Uses local-date arithmetic to avoid UTC-midnight timezone shifts.
 */
function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

// ─── Flight extraction ─────────────────────────────────────────────────────────

const TO_DEST_RE = /\bto\s+([A-Za-z][A-Za-z ]{1,22}?)(?:\s*[-–→,.(]|$)/i;
const ARROW_ROUTE_RE = /([A-Za-z][A-Za-z ]{1,18}?)\s*[-–→>]{1,2}\s*([A-Za-z][A-Za-z ]{1,18})/;

function extractFlightTitle(docTitle: string): string {
  const cleaned = cleanDocTitle(docTitle);
  const lower = cleaned.toLowerCase();

  if (lower.includes("boarding")) return "Flight check-in";

  const toMatch = cleaned.match(TO_DEST_RE);
  if (toMatch) {
    const dest = toMatch[1].trim();
    if (dest.length >= 3 && dest.length <= 22) return `Flight to ${cap(dest)}`;
  }

  const arrowMatch = cleaned.match(ARROW_ROUTE_RE);
  if (arrowMatch) {
    const dest = arrowMatch[2].trim();
    if (dest.length >= 2 && dest.length <= 20) return `Flight to ${cap(dest)}`;
  }

  return "Flight";
}

// ─── Hotel extraction ──────────────────────────────────────────────────────────

const HOTEL_GENERIC = /\s*[-–·:]\s*(?:confirmation|booking|reservation|receipt|invoice|voucher)\s*$/i;
const HOTEL_FULL_GENERIC = new Set([
  "hotel", "hotel confirmation", "hotel booking", "hotel reservation",
  "confirmation", "booking", "reservation", "receipt",
]);

function extractHotelName(docTitle: string): string {
  const cleaned = cleanDocTitle(docTitle);
  const lower = cleaned.toLowerCase().trim();

  if (HOTEL_FULL_GENERIC.has(lower)) return "Hotel";

  const stripped = cleaned.replace(HOTEL_GENERIC, "").trim();
  const withoutHotelWord = stripped.replace(/^hotel\s+/i, "").trim();
  const candidate = withoutHotelWord || stripped;

  if (!candidate || candidate.length < 3 || candidate.length > 36) return "Hotel";
  return candidate;
}

// ─── Booking classification ────────────────────────────────────────────────────

const BOOKING_CLASSIFIERS: {
  keywords: string[];
  label: string;
  actionType: DocumentGeneratedItem["actionType"];
}[] = [
  {
    keywords: ["restaurant", "dinner", "lunch", "breakfast", "bistro", "café", "cafe", "bar", "brasserie", "eatery", "dining"],
    label: "Dinner reservation",
    actionType: "restaurant",
  },
  {
    keywords: ["tour", "excursion", "sightseeing", "museum", "gallery", "exhibition", "attraction", "guided"],
    label: "Tour booking",
    actionType: "activity",
  },
  {
    keywords: ["concert", "show", "theatre", "theater", "performance", "festival", "gig", "event", "opera", "ballet", "tickets"],
    label: "Event booking",
    actionType: "activity",
  },
  {
    keywords: ["car hire", "car rental", "rental car", "rent a car", "vehicle hire"],
    label: "Car hire",
    actionType: "other",
  },
  {
    keywords: ["transfer", "shuttle", "taxi", "chauffeur", "pickup", "pick up", "pick-up"],
    label: "Transfer booking",
    actionType: "other",
  },
  {
    keywords: ["train", "rail", "railway", "eurostar", "tgv", "amtrak"],
    label: "Train booking",
    actionType: "train",
  },
  {
    keywords: ["spa", "massage", "wellness", "treatment", "facial", "salon"],
    label: "Spa booking",
    actionType: "activity",
  },
  {
    keywords: ["activity", "experience", "adventure", "class", "workshop", "lesson", "skydive", "kayak", "surf", "dive"],
    label: "Booked activity",
    actionType: "activity",
  },
];

const GENERIC_BOOKING = new Set([
  "booking", "reservation", "confirmation", "confirmed", "receipt", "booked", "voucher",
]);

type BookingClassification = {
  label: string;
  actionType: DocumentGeneratedItem["actionType"];
};

function classifyBooking(docTitle: string): BookingClassification {
  const cleaned = cleanDocTitle(docTitle);
  const lower = cleaned.toLowerCase();

  for (const { keywords, label, actionType } of BOOKING_CLASSIFIERS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { label, actionType };
    }
  }

  if (
    cleaned.length >= 3 &&
    cleaned.length <= 30 &&
    !GENERIC_BOOKING.has(lower.trim())
  ) {
    return { label: cap(cleaned), actionType: "activity" };
  }

  return { label: "Reservation", actionType: "activity" };
}

// ─── Generation engine ─────────────────────────────────────────────────────────

/**
 * Returns zero or more timeline item templates derived from a document's
 * category and title.
 *
 * When `tripContext` is provided, `event_date` is set to the best available
 * trip date for each item type (see date strategy at the top of this file).
 * Without `tripContext`, `event_date` is null and items sort last.
 *
 * Pure and synchronous — never touches the database.
 *
 * @param doc         Document metadata. Only `title` and `category` used for now.
 *                    Add `fileContent?: string` when upgrading to OCR/AI extraction.
 * @param tripContext Optional trip dates used to assign a fallback `event_date`.
 */
export function generateTimelineItemsFromDocument(
  doc: { title: string; category: DocumentCategory },
  tripContext?: TripDateContext
): DocumentGeneratedItem[] {
  const { category } = doc;
  const startDate = tripContext?.startDate ?? null;
  const endDate = tripContext?.endDate ?? null;

  switch (category) {
    case "flight": {
      const title = extractFlightTitle(doc.title);
      const isBoardingPass = title === "Flight check-in";
      return [
        {
          title,
          event_date: startDate,   // Flights depart on the trip start day
          time: "09:00",
          note: noteFor(
            doc.title,
            isBoardingPass
              ? "Confirm check-in time with airline · update date when known."
              : "Update departure date and time when confirmed."
          ),
          actionType: "flight",
        },
      ];
    }

    case "hotel": {
      const name = extractHotelName(doc.title);
      const label = name === "Hotel" ? "Hotel" : name;

      // Check-out fallback: trip end date, or start + 1 day if no end date.
      const checkOutDate = endDate ?? (startDate ? addDays(startDate, 1) : null);

      return [
        {
          title: `${label} check-in`,
          event_date: startDate,     // Check-in on arrival day
          time: "15:00",
          note: noteFor(doc.title, "Update check-in date when confirmed."),
          actionType: "hotel",
        },
        {
          title: `${label} check-out`,
          event_date: checkOutDate,  // Check-out on departure/last day
          time: "11:00",
          note: noteFor(doc.title, "Update check-out date when confirmed."),
          actionType: "hotel",
        },
      ];
    }

    case "booking": {
      const { label, actionType } = classifyBooking(doc.title);
      return [
        {
          title: label,
          event_date: startDate,   // Best guess: bookings fall in the trip window
          time: "12:00",
          note: noteFor(doc.title, "Update date and time when confirmed."),
          actionType,
        },
      ];
    }

    case "identity":
    case "other":
    default:
      return [];
  }
}
