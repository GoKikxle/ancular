/**
 * Smart Trip Suggestion Engine
 *
 * Generates contextual, destination-aware suggestions from existing trip data.
 * No external API required — runs purely from trip metadata.
 *
 * To upgrade to real AI suggestions in the future, replace getSuggestionsForTrip()
 * with a call to an AI provider. The Suggestion type and the calling code in
 * app/trips/[tripId]/page.tsx will not need to change.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SuggestionCategory =
  | "food"
  | "sightseeing"
  | "transport"
  | "weather-aware"
  | "admin"
  | "relaxation"
  | "culture"
  | "local-tip";

export type Suggestion = {
  /** Stable identifier — used for React keys and "added" state tracking. */
  id: string;
  title: string;
  description: string;
  category: SuggestionCategory;
  /** Human-readable time of day shown as a badge, e.g. "Morning", "Evening". */
  best_time?: string;
  /** 24-h time string used when inserting into timeline_items, e.g. "09:00". */
  suggested_time?: string;
  /** Short context note shown in muted text, e.g. "Based on your weather". */
  reason?: string;
};

export type SuggestionInput = {
  tripTitle: string;
  tripDates: string;
  weatherSummary?: string | null;
  weatherNote?: string | null;
};

// ─── Internal pool types ───────────────────────────────────────────────────────

type RawSuggestion = Omit<Suggestion, "id">;

// ─── Destination knowledge base ───────────────────────────────────────────────
//
// Each key is a lowercase destination name matched against the trip title.
// Suggestions are ordered by priority — the first N will be chosen.

const DESTINATION_POOL: Record<string, RawSuggestion[]> = {
  barcelona: [
    {
      title: "Book Sagrada Família in advance",
      description:
        "Gaudí's masterpiece sells out weeks ahead. Reserve an entry slot with audio guide online before you land.",
      category: "sightseeing",
      best_time: "Morning",
      suggested_time: "09:00",
    },
    {
      title: "Tapas in El Born neighbourhood",
      description:
        "Skip the tourist strips on Las Ramblas. El Born's pintxos bars are where locals eat — livelier and better value.",
      category: "food",
      best_time: "Evening",
      suggested_time: "20:00",
    },
    {
      title: "Barceloneta Beach walk before 10am",
      description:
        "Far less crowded at sunrise. Great for a morning swim or a coffee by the water before the day starts.",
      category: "relaxation",
      best_time: "Morning",
      suggested_time: "08:00",
    },
    {
      title: "T-Casual metro card on arrival",
      description:
        "A 10-trip metro card is far cheaper than single tickets and covers all zones, including the airport L9 line.",
      category: "transport",
    },
    {
      title: "La Boqueria market early",
      description:
        "The market fills up by 10am. Arrive at 8am for the best produce, freshest seafood, and fewer tour groups.",
      category: "food",
      best_time: "Morning",
      suggested_time: "08:00",
    },
    {
      title: "Gothic Quarter self-guided walk",
      description:
        "Flat, compact, and walkable. Download a self-guided audio tour or pick up a map from your hotel.",
      category: "culture",
      best_time: "Afternoon",
      suggested_time: "14:00",
    },
  ],

  paris: [
    {
      title: "Croissant at a neighbourhood boulangerie",
      description:
        "Skip the hotel breakfast. Find a local boulangerie — freshly baked by 7am, a fraction of the café price.",
      category: "food",
      best_time: "Morning",
      suggested_time: "07:30",
    },
    {
      title: "Louvre on Wednesday or Friday evenings",
      description:
        "Open until 9:45pm on these nights — dramatically fewer crowds than daytime. Go straight to the Denon wing.",
      category: "sightseeing",
      best_time: "Evening",
      suggested_time: "18:00",
    },
    {
      title: "Navigo card for metro and RER",
      description:
        "Cheaper than individual tickets if you're staying 3+ days. Covers metro, bus, RER, and Orly/CDG rail links.",
      category: "transport",
    },
    {
      title: "Walk Montmartre before 8am",
      description:
        "The hilltop village is magical at dawn, before tourist crowds arrive. Café des Deux Moulins opens early.",
      category: "culture",
      best_time: "Morning",
      suggested_time: "07:00",
    },
    {
      title: "Seine riverside at golden hour",
      description:
        "Pont Alexandre III at sunset is one of Paris's best photo spots. A slow walk along the Left Bank is free.",
      category: "relaxation",
      best_time: "Evening",
      suggested_time: "19:00",
    },
  ],

  london: [
    {
      title: "Tap your card on the Tube — no Oyster needed",
      description:
        "Contactless bank cards and Apple/Google Pay apply the same daily and weekly caps as an Oyster card. Simpler.",
      category: "transport",
    },
    {
      title: "Borough Market for lunch (Thu–Sat)",
      description:
        "One of Europe's finest food markets. Artisan bread, cheeses, and street food. Get there before 12:30pm.",
      category: "food",
      best_time: "Afternoon",
      suggested_time: "12:30",
    },
    {
      title: "Free world-class museums",
      description:
        "British Museum, Natural History, V&A, National Gallery, Tate Modern — all free, no booking required.",
      category: "culture",
      reason: "A London highlight most visitors miss",
    },
    {
      title: "Sunday roast at a classic pub",
      description:
        "A British institution. Roast beef, Yorkshire pudding, gravy. Book a table — the best pubs fill by noon.",
      category: "food",
      best_time: "Afternoon",
      suggested_time: "13:00",
    },
    {
      title: "Black cab: lit yellow sign = available",
      description:
        "Flag one down when the yellow light is on. Metered, reliable, and drivers know every street by heart.",
      category: "transport",
    },
  ],

  tokyo: [
    {
      title: "Get a Suica or Pasmo IC card",
      description:
        "Top it up at any station and tap on/off trains, subway, buses, and even convenience stores. Indispensable.",
      category: "transport",
    },
    {
      title: "Senso-ji Temple before 7am",
      description:
        "The ancient temple in Asakusa is peaceful and fog-draped at dawn, before the daytime crowds arrive.",
      category: "culture",
      best_time: "Morning",
      suggested_time: "06:30",
    },
    {
      title: "Ramen at Fuunji, Ichiran, or Afuri",
      description:
        "Three distinct styles: Fuunji for rich tsukemen, Ichiran for solo dining booths, Afuri for yuzu shio.",
      category: "food",
      best_time: "Lunch",
      suggested_time: "12:00",
    },
    {
      title: "Convenience stores are exceptional",
      description:
        "7-Eleven and Lawson sell hot onigiri, fresh sandwiches, excellent coffee, and ATMs that accept foreign cards.",
      category: "local-tip",
    },
    {
      title: "Shibuya crossing at dusk",
      description:
        "Best viewed from the Mag's Park observation deck or Starbucks across the street. Peak atmosphere at 6–8pm.",
      category: "sightseeing",
      best_time: "Evening",
      suggested_time: "18:30",
    },
    {
      title: "Conveyor belt sushi (kaiten-zushi)",
      description:
        "Fun, affordable, and quality-controlled. Look for Genki Sushi or Hamazushi — tablet ordering, no language barrier.",
      category: "food",
      best_time: "Lunch",
      suggested_time: "13:00",
    },
  ],

  lagos: [
    {
      title: "Use Bolt or inDrive — not street cabs",
      description:
        "Fixed-price ride-hailing is essential in Lagos. Agree on fares upfront with any unmetered taxi. Allow 2× your expected travel time.",
      category: "transport",
      reason: "Lagos traffic is unpredictable",
    },
    {
      title: "Confirm all meetings 24h before",
      description:
        "Lagos schedules shift frequently. Reconfirm every appointment the evening before to avoid wasted journeys.",
      category: "admin",
    },
    {
      title: "Dinner in Lekki Phase 1",
      description:
        "NOK by Alara, Nok-Nok, and Heaven's Kitchen offer consistently excellent Lagos dining. Book ahead on weekends.",
      category: "food",
      best_time: "Evening",
      suggested_time: "19:30",
    },
    {
      title: "Carry small Naira notes",
      description:
        "Many vendors, market traders, and drivers prefer exact change. Keep ₦100–500 notes readily accessible.",
      category: "local-tip",
    },
    {
      title: "Travel between 10am and 2pm",
      description:
        "Morning (7–9am) and evening (4–8pm) rush hours can add 2+ hours to any journey. Plan major meetings accordingly.",
      category: "transport",
    },
    {
      title: "Suya from a trusted stall",
      description:
        "Spiced grilled meat skewers — a Lagos staple. Ask a local for the best nearby stall rather than relying on apps.",
      category: "food",
      best_time: "Evening",
      suggested_time: "20:00",
    },
  ],

  rome: [
    {
      title: "Pre-book Vatican and Colosseum tickets",
      description:
        "Both sell out daily — often weeks in advance in peak season. Online booking is non-negotiable.",
      category: "admin",
    },
    {
      title: "Aperitivo in Trastevere at dusk",
      description:
        "Many bars offer free snacks with drinks 6–8pm. A beloved local ritual — wander and pick the busiest spot.",
      category: "food",
      best_time: "Evening",
      suggested_time: "18:30",
    },
    {
      title: "Dress modestly for churches",
      description:
        "Knees and shoulders must be covered at the Vatican and most basilicas. A scarf or wrap works perfectly.",
      category: "culture",
    },
    {
      title: "Artisan gelato — know the signs",
      description:
        "Avoid gelato heaped high in metal cans. Flat, covered containers are the mark of a real gelateria.",
      category: "food",
    },
    {
      title: "Roma Pass for metro and museums",
      description:
        "48h or 72h Roma Pass covers metro, buses, and some museum entries. Worth it from day 2 onwards.",
      category: "transport",
    },
  ],

  "new york": [
    {
      title: "Tap-to-pay on the subway — no MetroCard queue",
      description:
        "Contactless cards and Apple/Google Pay work on all turnstiles. A 7-day unlimited card pays off from day 3.",
      category: "transport",
    },
    {
      title: "A proper NYC bagel",
      description:
        "Ess-a-Bagel or Murray's Bagels — classic lox and cream cheese. Worth the queue. Hotel bagels don't count.",
      category: "food",
      best_time: "Morning",
      suggested_time: "08:30",
    },
    {
      title: "Walk the Brooklyn Bridge (Brooklyn → Manhattan)",
      description:
        "Start from DUMBO side for the best skyline views. Morning light is spectacular. Free, 30 minutes one way.",
      category: "sightseeing",
      best_time: "Morning",
      suggested_time: "08:00",
    },
    {
      title: "The High Line in late afternoon",
      description:
        "An elevated park above Manhattan's west side. Best in golden-hour light. Free, no booking needed.",
      category: "relaxation",
      best_time: "Afternoon",
      suggested_time: "16:00",
    },
    {
      title: "Rooftop happy hour in the Meatpacking District",
      description:
        "Several bars offer 2-for-1 cocktails weekdays 5–7pm. Le Bain at The Standard is a classic choice.",
      category: "food",
      best_time: "Evening",
      suggested_time: "17:30",
    },
  ],

  dubai: [
    {
      title: "Download Careem before landing",
      description:
        "Both Careem and Uber work well. Avoid unmetered taxis — always agree on a fixed fare upfront if you take one.",
      category: "transport",
    },
    {
      title: "Dress modestly in malls and public areas",
      description:
        "Shoulders and knees covered is the standard. Swimwear restricted to beach and pool areas only.",
      category: "culture",
    },
    {
      title: "Plan outdoor activities for morning or post-4pm",
      description:
        "May–September midday heat makes outdoor sightseeing genuinely uncomfortable. Stick to early or late.",
      category: "weather-aware",
      reason: "Based on Dubai's climate",
    },
    {
      title: "Dubai Marina walk at sunset",
      description:
        "The waterfront promenade is at its best after dark, when the city lights reflect off the water.",
      category: "sightseeing",
      best_time: "Evening",
      suggested_time: "19:00",
    },
    {
      title: "Friday brunch — a Dubai institution",
      description:
        "Hotels offer lavish all-inclusive Friday brunches. Bab Al Bahr at Abu Dhabi and Jetty Lounge are iconic.",
      category: "food",
      best_time: "Afternoon",
      suggested_time: "13:00",
    },
  ],

  bali: [
    {
      title: "Wear a sarong at temples",
      description:
        "Required at all temples. Many temples lend them, but buying an inexpensive one from a market is easier.",
      category: "culture",
    },
    {
      title: "Hire a private driver for day trips",
      description:
        "Rp 300k–500k/day for a private driver with car is the easiest way to reach Ubud, Uluwatu, and rice terraces.",
      category: "transport",
    },
    {
      title: "Sunset at Tanah Lot or Uluwatu",
      description:
        "Both sea temples turn golden at sunset. Book Kecak fire dance at Uluwatu in advance — sells out fast.",
      category: "relaxation",
      best_time: "Evening",
      suggested_time: "18:00",
    },
    {
      title: "Eat at a local warung",
      description:
        "Warungs (family-run stalls) serve the best nasi goreng and satay. Avoid the polished tourist restaurants.",
      category: "food",
      best_time: "Lunch",
      suggested_time: "12:30",
    },
    {
      title: "Negotiate at markets — it's expected",
      description:
        "Start at 40% of the asking price and meet in the middle. Friendly haggling is standard and part of the experience.",
      category: "local-tip",
    },
  ],

  amsterdam: [
    {
      title: "Book Anne Frank House well in advance",
      description:
        "No same-day or walk-in tickets. Sells out completely. Book online as far ahead as possible.",
      category: "admin",
    },
    {
      title: "Rent a bike — it's how Amsterdam works",
      description:
        "MacBike or Donkey Republic for rentals. Stay in designated lanes, follow traffic signals, use a lock.",
      category: "transport",
      best_time: "Daytime",
      suggested_time: "09:00",
    },
    {
      title: "GVB day pass for trams and buses",
      description:
        "24h, 48h, and 72h passes cover trams, buses, and metro. Useful if you're not cycling every day.",
      category: "transport",
    },
    {
      title: "Stroopwafels fresh from a market stall",
      description:
        "Try one warm at the Albert Cuyp or Noordermarkt. Infinitely better than the pre-packaged versions.",
      category: "food",
    },
    {
      title: "Canal boat rental at golden hour",
      description:
        "Rent a small electric pedal boat (no licence needed) and cruise the canals yourself at sunset.",
      category: "relaxation",
      best_time: "Evening",
      suggested_time: "18:30",
    },
  ],

  singapore: [
    {
      title: "Eat at a hawker centre",
      description:
        "Maxwell Food Centre or Lau Pa Sat for lunch — Michelin-recommended street food at S$5–10. Air-conditioned and safe.",
      category: "food",
      best_time: "Lunch",
      suggested_time: "12:00",
    },
    {
      title: "EZ-Link card for MRT and buses",
      description:
        "Singapore's metro is world-class. Top up the EZ-Link card at any station — covers trains, buses, and even some shops.",
      category: "transport",
    },
    {
      title: "Gardens by the Bay — free during the day",
      description:
        "The Supertree Grove and skywalks are free. Pay only for the indoor conservatories. Light show at 7:45pm and 8:45pm nightly.",
      category: "sightseeing",
      best_time: "Evening",
      suggested_time: "19:30",
    },
    {
      title: "Singapore's strict laws — a quick note",
      description:
        "No gum, no eating or drinking on MRT, jaywalking fines apply. Easy to adjust to — just good to know upfront.",
      category: "admin",
    },
  ],

  istanbul: [
    {
      title: "Istanbulkart for all transport",
      description:
        "Buy one at any airport kiosk. Works on metro, tram, ferry, and bus. Shareable between people.",
      category: "transport",
    },
    {
      title: "Dress modestly for mosques",
      description:
        "Shoes off at the entrance, shoulders and knees covered. Scarves are provided at Hagia Sophia and the Blue Mosque.",
      category: "culture",
    },
    {
      title: "Breakfast at a traditional lokanta",
      description:
        "Turkish breakfast is an event: cheese, olives, eggs, bread, tomatoes, honey, tea. Moda or Kadıköy for locals.",
      category: "food",
      best_time: "Morning",
      suggested_time: "09:00",
    },
    {
      title: "Bosphorus ferry at dusk",
      description:
        "The public ferry between Beşiktaş and Üsküdar costs ₺30 and gives a stunning view of the city at golden hour.",
      category: "sightseeing",
      best_time: "Evening",
      suggested_time: "18:00",
    },
    {
      title: "Grand Bazaar — arrive with a clear list",
      description:
        "Overwhelming without a plan. Know what you want (spices, textiles, ceramics) and negotiate confidently.",
      category: "local-tip",
      best_time: "Morning",
      suggested_time: "10:00",
    },
  ],

  lisbon: [
    {
      title: "Tram 28 — get on at Martim Moniz",
      description:
        "Board at the start of the line (Martim Moniz) to guarantee a seat. The most scenic city tram ride in Europe.",
      category: "sightseeing",
      best_time: "Morning",
      suggested_time: "09:00",
    },
    {
      title: "Pastéis de nata at Pastéis de Belém",
      description:
        "The original custard tarts since 1837. Queue is always long — go early or mid-afternoon. Worth every minute.",
      category: "food",
      best_time: "Morning",
      suggested_time: "10:00",
    },
    {
      title: "Fado show in Alfama in the evening",
      description:
        "Book a table at a tasca that includes dinner and a live Fado performance. The neighbourhood is quieter after 9pm.",
      category: "culture",
      best_time: "Evening",
      suggested_time: "20:00",
    },
    {
      title: "Viva Viagem card for metro and trams",
      description:
        "Reloadable card covers metro, trams (including 28E), buses, and some ferry routes. Much cheaper than singles.",
      category: "transport",
    },
  ],
};

// ─── Generic fallback pool ─────────────────────────────────────────────────────
//
// Used when no destination is matched from the trip title.

const GENERIC_POOL: RawSuggestion[] = [
  {
    title: "Download offline maps before you go",
    description:
      "Save the destination area in Google Maps or Maps.me offline. Works without data and is invaluable on arrival.",
    category: "admin",
  },
  {
    title: "Get a local SIM or international data plan",
    description:
      "Arriving with data connectivity — for maps, translation, and ride-hailing — saves time and stress on day one.",
    category: "admin",
  },
  {
    title: "Research your airport transfer in advance",
    description:
      "Know whether to take the train, bus, or taxi before landing, and the expected cost. Avoid the first-arrival confusion.",
    category: "transport",
  },
  {
    title: "Ask your accommodation for restaurant picks",
    description:
      "Hotel and Airbnb hosts always know the best neighbourhood spots that don't appear in any guidebook.",
    category: "food",
  },
  {
    title: "Notify your bank before travelling",
    description:
      "Avoid card blocks mid-trip by telling your bank which countries you'll visit. Takes 2 minutes online.",
    category: "admin",
  },
  {
    title: "Carry a small local currency reserve",
    description:
      "Markets, taxis, and small restaurants often prefer cash. Exchange a modest amount at the airport or on arrival.",
    category: "local-tip",
  },
  {
    title: "Book popular attractions ahead",
    description:
      "Top museums and experiences at most major destinations sell out. Reserve online 1–2 weeks in advance.",
    category: "sightseeing",
  },
];

// ─── Weather-aware suggestions ────────────────────────────────────────────────

type WeatherContext = "rainy" | "hot" | "cold" | "neutral";

const WEATHER_SUGGESTIONS: Record<Exclude<WeatherContext, "neutral">, RawSuggestion> = {
  rainy: {
    title: "Plan indoor backup activities",
    description:
      "Rain in the forecast. Identify a museum, gallery, or covered market for flexible downtime.",
    category: "weather-aware",
    reason: "Based on your trip weather",
  },
  hot: {
    title: "Pace outdoor time around the heat",
    description:
      "High temperatures expected. Plan outdoor sightseeing before 11am or after 4pm — carry water and sunscreen.",
    category: "weather-aware",
    reason: "Based on your trip weather",
  },
  cold: {
    title: "Pack thermal layers",
    description:
      "Cold weather ahead. A moisture-wicking base layer, mid-layer fleece, and windproof outer will cover most conditions.",
    category: "weather-aware",
    reason: "Based on your trip weather",
  },
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

function slugId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function detectDestination(tripTitle: string): string | null {
  const lower = tripTitle.toLowerCase();
  return (
    Object.keys(DESTINATION_POOL).find((dest) => lower.includes(dest)) ?? null
  );
}

function detectWeatherContext(summary?: string | null): WeatherContext {
  const s = (summary ?? "").toLowerCase();
  if (s.includes("rain") || s.includes("wet") || s.includes("monsoon") || s.includes("shower"))
    return "rainy";
  if (s.includes("hot") || s.includes("heat") || s.includes("humid") || s.includes("warm") || s.includes("sunny"))
    return "hot";
  if (s.includes("cold") || s.includes("snow") || s.includes("freez") || s.includes("frost") || s.includes("chilly"))
    return "cold";
  return "neutral";
}

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * Generate smart, contextual suggestions for a trip.
 *
 * Priority order:
 *   1. Weather-aware suggestion (if weather_summary indicates notable conditions)
 *   2. Destination-specific suggestions (matched from trip title)
 *   3. Generic travel suggestions (fallback if no destination matched)
 *
 * Returns at most 5 suggestions.
 */
export function getSuggestionsForTrip(input: SuggestionInput): Suggestion[] {
  const MAX = 5;
  const raw: RawSuggestion[] = [];

  // 1 — Weather-aware suggestion (takes one slot if conditions are notable)
  const weather = detectWeatherContext(input.weatherSummary);
  if (weather !== "neutral") {
    raw.push(WEATHER_SUGGESTIONS[weather]);
  }

  // 2 — Destination-specific or generic suggestions
  const dest = detectDestination(input.tripTitle);
  const pool = dest ? DESTINATION_POOL[dest] : GENERIC_POOL;

  // Fill remaining slots from the pool, capping category repeats where possible
  const usedCategories = new Set(raw.map((s) => s.category));
  const remaining = MAX - raw.length;

  // First pass: pick suggestions with fresh categories
  const deferred: RawSuggestion[] = [];
  for (const s of pool) {
    if (raw.length >= MAX) break;
    if (!usedCategories.has(s.category)) {
      raw.push(s);
      usedCategories.add(s.category);
    } else {
      deferred.push(s);
    }
  }

  // Second pass: fill any remaining slots from deferred (category duplicates OK)
  for (const s of deferred) {
    if (raw.length >= MAX) break;
    raw.push(s);
  }

  // Attach stable IDs
  return raw.slice(0, MAX).map((s) => ({ ...s, id: slugId(s.title) }));
}
