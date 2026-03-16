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
 *   3. Populate `eventDate` and `time` from the extracted values instead of placeholders.
 *
 * All callers (`insertDocumentTimelineItems`, server actions) stay unchanged.
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

// ─── Flight extraction ─────────────────────────────────────────────────────────

// Matches "to [Destination]" — e.g. "flight to barcelona", "London to Heathrow"
const TO_DEST_RE = /\bto\s+([A-Za-z][A-Za-z ]{1,22}?)(?:\s*[-–→,.(]|$)/i;

// Matches route arrows — "London → Barcelona", "LHR → BCN", "LHR->BCN"
const ARROW_ROUTE_RE = /([A-Za-z][A-Za-z ]{1,18}?)\s*[-–→>]{1,2}\s*([A-Za-z][A-Za-z ]{1,18})/;

/**
 * Derives a travel-specific flight title from the document title.
 *
 * Priority:
 *   1. "boarding" anywhere          → "Flight check-in"
 *   2. "to [Destination]" pattern   → "Flight to [Destination]"
 *   3. "[Origin] → [Dest]" pattern  → "Flight to [Destination]"
 *   4. Fallback                     → "Flight"
 */
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

// Generic words that don't form part of a hotel name
const HOTEL_GENERIC = /\s*[-–·:]\s*(?:confirmation|booking|reservation|receipt|invoice|voucher)\s*$/i;
const HOTEL_FULL_GENERIC = new Set([
  "hotel", "hotel confirmation", "hotel booking", "hotel reservation",
  "confirmation", "booking", "reservation", "receipt",
]);

/**
 * Extracts the hotel name from the document title.
 * Returns the name if it looks specific, or "Hotel" as a fallback.
 *
 * Examples:
 *   "Best Western London"              → "Best Western London"
 *   "Holiday Inn Barcelona confirmation" → "Holiday Inn Barcelona"
 *   "Hotel confirmation"               → "Hotel"
 *   "Marriott Booking"                 → "Marriott"
 */
function extractHotelName(docTitle: string): string {
  const cleaned = cleanDocTitle(docTitle);
  const lower = cleaned.toLowerCase().trim();

  if (HOTEL_FULL_GENERIC.has(lower)) return "Hotel";

  // Strip trailing confirmation/booking/receipt suffixes
  const stripped = cleaned.replace(HOTEL_GENERIC, "").trim();

  // Strip the word "hotel" if it's the whole remaining string
  const withoutHotelWord = stripped.replace(/^hotel\s+/i, "").trim();

  const candidate = withoutHotelWord || stripped;
  if (!candidate || candidate.length < 3 || candidate.length > 36) return "Hotel";

  return candidate;
}

// ─── Booking classification ────────────────────────────────────────────────────

/**
 * Keyword buckets map document title words to a descriptive timeline label.
 * Checked in order — first match wins.
 */
const BOOKING_CLASSIFIERS: { keywords: string[]; label: string; actionType: DocumentGeneratedItem["actionType"] }[] = [
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

// Pure generic booking words that shouldn't become the timeline title
const GENERIC_BOOKING = new Set([
  "booking", "reservation", "confirmation", "confirmed", "receipt", "booked", "voucher",
]);

type BookingClassification = { label: string; actionType: DocumentGeneratedItem["actionType"] };

/**
 * Classifies a booking document title into a travel-specific timeline label.
 *
 * Priority:
 *   1. Keyword match → classified label (e.g. "Dinner reservation", "Tour booking")
 *   2. Specific non-generic title ≤ 30 chars → use the title as-is
 *   3. Fallback → "Reservation"
 */
function classifyBooking(docTitle: string): BookingClassification {
  const cleaned = cleanDocTitle(docTitle);
  const lower = cleaned.toLowerCase();

  for (const { keywords, label, actionType } of BOOKING_CLASSIFIERS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { label, actionType };
    }
  }

  // If the title is specific (not a generic word), use it directly
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
 * category and title. All items have `event_date: null` (no date known yet)
 * so they sort after explicitly-dated items and the user can fill them in.
 *
 * Pure and synchronous — never touches the database.
 *
 * @param doc  Document metadata. Only `title` and `category` are used for now.
 *             Add `fileContent?: string` here when upgrading to OCR/AI extraction.
 */
export function generateTimelineItemsFromDocument(doc: {
  title: string;
  category: DocumentCategory;
}): DocumentGeneratedItem[] {
  const { category } = doc;

  switch (category) {
    case "flight": {
      const title = extractFlightTitle(doc.title);
      const isBoardingPass = title === "Flight check-in";
      return [
        {
          title,
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
      return [
        {
          title: `${label} check-in`,
          time: "15:00",
          note: noteFor(doc.title, "Update check-in date when confirmed."),
          actionType: "hotel",
        },
        {
          title: `${label} check-out`,
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
