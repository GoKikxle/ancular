/**
 * AI Itinerary Generator — provider-agnostic interface.
 *
 * To connect a real AI model, replace the body of `generateItinerary` with a
 * provider call. The function signature, input shape, and return type must not
 * change so that the rest of the app stays untouched.
 *
 * ── OpenAI example ───────────────────────────────────────────────────────────
 *   import OpenAI from "openai";
 *   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 *   const { system, user } = buildItineraryPrompt(input);
 *   const res = await client.chat.completions.create({
 *     model: "gpt-4o",
 *     response_format: { type: "json_object" },
 *     messages: [{ role: "system", content: system }, { role: "user", content: user }],
 *   });
 *   const items = JSON.parse(res.choices[0].message.content ?? "[]");
 *   return { items, error: null };
 *
 * ── Anthropic example ────────────────────────────────────────────────────────
 *   import Anthropic from "@anthropic-ai/sdk";
 *   const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
 *   const { system, user } = buildItineraryPrompt(input);
 *   const res = await client.messages.create({
 *     model: "claude-opus-4-5",
 *     max_tokens: 2048,
 *     system,
 *     messages: [{ role: "user", content: user }],
 *   });
 *   const items = JSON.parse((res.content[0] as { text: string }).text);
 *   return { items, error: null };
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ItineraryInput = {
  // From the trip record
  tripTitle: string;
  tripDates: string;
  weatherSummary?: string | null;
  weatherNote?: string | null;
  // From the user preferences form
  destination?: string;
  travelStyle?: string; // "Cultural" | "Adventure" | "Relaxation" | "Business" | "Family"
  interests?: string;   // free text e.g. "museums, food, hiking"
  pace?: string;        // "Slow" | "Moderate" | "Packed"
  notes?: string;
};

export type GeneratedItem = {
  time: string;       // 24-h string e.g. "09:00"
  title: string;
  note: string;
  location?: string;
  /** TODO: persisted once `document_label` column exists in timeline_items */
  document_label?: string;
  sort_order: number; // 1-based
};

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * Generate an itinerary for a trip.
 * Currently uses the smart mock generator below.
 * Replace with a real provider call when an API key is available.
 */
export async function generateItinerary(
  input: ItineraryInput
): Promise<{ items: GeneratedItem[]; error: string | null }> {
  // ── Real AI integration point ─────────────────────────────────────────────
  // Check for a configured provider and delegate:
  //
  // if (process.env.OPENAI_API_KEY) {
  //   return generateWithOpenAI(input);
  // }
  // if (process.env.ANTHROPIC_API_KEY) {
  //   return generateWithAnthropic(input);
  // }
  // ─────────────────────────────────────────────────────────────────────────

  try {
    const items = mockGenerator(input);
    return { items, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown generation error";
    return { items: [], error: message };
  }
}

// ─── Prompt builder (ready for real AI use) ───────────────────────────────────

/**
 * Builds a system + user prompt pair for any chat-completion model.
 * The prompt instructs the model to return a JSON array matching GeneratedItem[].
 */
export function buildItineraryPrompt(input: ItineraryInput): {
  system: string;
  user: string;
} {
  const system = [
    "You are a world-class travel planner.",
    "Generate a structured one-day trip itinerary as a JSON array.",
    "Each element must have exactly these fields:",
    "  time (string, 24-h format, e.g. \"09:00\"),",
    "  title (string),",
    "  note (string — one concise sentence),",
    "  location (string or null),",
    "  document_label (string or null — e.g. \"Boarding pass\"),",
    "  sort_order (integer, starting at 1).",
    "Respond ONLY with a valid JSON array. No prose, no markdown fences.",
  ].join(" ");

  const lines = [
    `Trip: ${input.tripTitle}`,
    input.tripDates ? `Dates: ${input.tripDates}` : "",
    input.destination ? `Destination: ${input.destination}` : "",
    input.travelStyle ? `Travel style: ${input.travelStyle}` : "",
    input.interests ? `Interests: ${input.interests}` : "",
    input.pace ? `Pace: ${input.pace}` : "",
    input.weatherSummary ? `Weather: ${input.weatherSummary}` : "",
    input.weatherNote ? `Weather note: ${input.weatherNote}` : "",
    input.notes ? `Extra notes: ${input.notes}` : "",
  ].filter(Boolean);

  return { system, user: lines.join("\n") };
}

// ─── Smart mock generator ─────────────────────────────────────────────────────

/** Extract a short destination hint from trip title or explicit field. */
function extractPlace(tripTitle: string, destination?: string): string {
  if (destination?.trim()) return destination.trim();
  // Look for a capitalised word longer than 3 chars (likely a place name)
  const match = tripTitle.match(/\b([A-Z][a-z]{3,})\b/);
  return match ? match[1] : tripTitle;
}

function mockGenerator(input: ItineraryInput): GeneratedItem[] {
  const place = extractPlace(input.tripTitle, input.destination);
  const pace = input.pace ?? "Moderate";
  const style = input.travelStyle ?? "Cultural";
  const interests = input.interests?.toLowerCase() ?? "";

  const isBusinessy = style === "Business";
  const isAdventure = style === "Adventure";
  const isRelaxed = style === "Relaxation";
  const isSlow = pace === "Slow";
  const isPacked = pace === "Packed";
  const foodFocused = interests.includes("food");

  const events: Omit<GeneratedItem, "sort_order">[] = [];

  // Morning start
  events.push({
    time: isSlow ? "08:30" : "07:30",
    title: `Arrive / check in — ${place}`,
    note: `Get settled and grab breakfast near your accommodation in ${place}.`,
    location: `${place} — accommodation`,
  });

  // Mid-morning
  events.push({
    time: isSlow ? "10:30" : "09:30",
    title: isBusinessy
      ? "Morning meetings"
      : isAdventure
      ? `Morning activity near ${place}`
      : `Explore ${place}`,
    note: isBusinessy
      ? `Back-to-back sessions with local partners or venue walkthrough.`
      : isAdventure
      ? `Join a guided outdoor activity or head to a scenic spot near ${place}.`
      : `Walk through the main streets and soak in the local atmosphere.`,
    location: isBusinessy ? `${place} — conference / meeting venue` : `${place} centre`,
  });

  // Lunch
  events.push({
    time: "12:30",
    title: `Lunch in ${place}`,
    note: foodFocused
      ? `Try a highly-rated local restaurant — research ahead for the destination's signature dish.`
      : `Grab a local meal and recharge before the afternoon programme.`,
    location: `${place} — local restaurant`,
  });

  // Afternoon main
  events.push({
    time: isSlow ? "14:30" : "14:00",
    title: isBusinessy
      ? "Afternoon session"
      : isRelaxed
      ? `Leisure time — ${place}`
      : isAdventure
      ? `Second activity / exploration`
      : `${place} highlights`,
    note: isBusinessy
      ? `Continue meetings, networking, or client dinners prep.`
      : isRelaxed
      ? `Spa, beach, or a slow café afternoon — no agenda required.`
      : isAdventure
      ? `Head to a different trail, viewpoint, or local market.`
      : `Visit the top cultural or historic sites. Book timed entry in advance.`,
    location: isBusinessy ? `${place} — venue` : place,
  });

  // Extra stop for packed pace
  if (isPacked) {
    events.push({
      time: "16:30",
      title: `Afternoon extension — ${place}`,
      note: `A second neighbourhood or attraction to make the most of the day before sunset.`,
      location: `${place} — secondary attraction`,
    });
  }

  // Evening
  events.push({
    time: isSlow ? "18:30" : "18:00",
    title: `Evening in ${place}`,
    note: `Take an evening walk, catch the sunset, or grab a pre-dinner drink at a rooftop bar.`,
    location: place,
  });

  // Dinner
  events.push({
    time: isSlow ? "20:30" : "20:00",
    title: `Dinner`,
    note: foodFocused
      ? `Book a well-reviewed restaurant in advance — ${place} is known for its food scene.`
      : `Dinner reservation recommended. Check local guides for top picks.`,
    location: `${place} — restaurant`,
    document_label: undefined,
  });

  // Late night for packed pace
  if (isPacked) {
    events.push({
      time: "22:00",
      title: `Late evening`,
      note: `Optional: live music venue, a show, or a night-time stroll through ${place}.`,
      location: place,
    });
  }

  return events.map((e, i) => ({ ...e, sort_order: i + 1 }));
}
