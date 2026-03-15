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
// Pools are ordered by priority — the selection algorithm prefers category
// diversity, then falls back to duplicates. Keep 10+ entries per priority
// destination so the engine has enough variety across all categories.

const DESTINATION_POOL: Record<string, RawSuggestion[]> = {
  barcelona: [
    {
      title: "Book Sagrada Família before you land",
      description:
        "Gaudí's basilica sells out weeks ahead. Reserve a timed slot with audio guide online — morning entry has the best light through the stained glass.",
      category: "sightseeing",
      best_time: "Morning",
      suggested_time: "09:00",
    },
    {
      title: "Tapas in El Born, not Las Ramblas",
      description:
        "El Born's pintxos bars are where locals actually eat — livelier, cheaper, and a world away from the tourist trap stretch.",
      category: "food",
      best_time: "Evening",
      suggested_time: "20:00",
    },
    {
      title: "T-Casual metro card on arrival",
      description:
        "A 10-trip card is a fraction of the cost of singles and covers every zone, including the L9 Sud airport line.",
      category: "transport",
    },
    {
      title: "Barceloneta Beach before 10am",
      description:
        "Far less crowded at sunrise — ideal for a morning swim, a quiet coffee by the water, or a jog along the promenade.",
      category: "relaxation",
      best_time: "Morning",
      suggested_time: "08:00",
    },
    {
      title: "La Boqueria market early",
      description:
        "The market floods with tour groups by 10am. Arrive at 8am for the best produce, freshest seafood, and no queue at the juice stalls.",
      category: "food",
      best_time: "Morning",
      suggested_time: "08:00",
    },
    {
      title: "Gothic Quarter on foot — it's small",
      description:
        "The whole barri is walkable in two hours. Download an audio tour or pick up a map — the Roman ruins under Plaça Nova are free.",
      category: "culture",
      best_time: "Afternoon",
      suggested_time: "14:00",
    },
    {
      title: "Park Güell — book timed entry",
      description:
        "The Monumental Zone requires a ticket. Early morning slots (8–9am) give you the terraces almost to yourself before the crowds arrive.",
      category: "sightseeing",
      best_time: "Morning",
      suggested_time: "08:00",
    },
    {
      title: "Picasso Museum — free on Thursdays",
      description:
        "Admission is free Thursday evenings from 6pm and the first Sunday of each month. Book a free slot online to avoid queuing.",
      category: "culture",
      best_time: "Evening",
      suggested_time: "18:00",
    },
    {
      title: "Vermouth hour at a traditional bar",
      description:
        "Barcelonins take vermut (vermouth) seriously before Sunday lunch. Bar Calders in Sant Antoni or El Xampanyet in El Born are classics.",
      category: "local-tip",
      best_time: "Afternoon",
      suggested_time: "13:00",
    },
    {
      title: "No need to tip in bars",
      description:
        "Service is included in Catalan bar culture. Rounding up is appreciated but a full 15–20% tip is not expected — save it.",
      category: "local-tip",
    },
    {
      title: "Parc de la Ciutadella for a midday break",
      description:
        "A beautiful free park in the heart of the city. Perfect for a late-morning picnic or to escape the midday heat under the trees.",
      category: "relaxation",
      best_time: "Afternoon",
      suggested_time: "12:30",
    },
  ],

  paris: [
    {
      title: "Croissant at a neighbourhood boulangerie",
      description:
        "Skip the hotel breakfast. Find a local boulangerie — freshly baked by 7am at a fraction of the café price. Ask for it au beurre.",
      category: "food",
      best_time: "Morning",
      suggested_time: "07:30",
    },
    {
      title: "Louvre on Wednesday or Friday evenings",
      description:
        "Extended opening until 9:45pm — dramatically fewer crowds than daytime. Head straight to the Denon wing for the Italian masters.",
      category: "sightseeing",
      best_time: "Evening",
      suggested_time: "18:00",
    },
    {
      title: "Navigo card for metro and RER",
      description:
        "Cheaper than individual tickets from day 3. Covers metro, bus, RER A and B — including both Orly and CDG airport connections.",
      category: "transport",
    },
    {
      title: "Montmartre before 8am",
      description:
        "The hilltop village is magical at dawn — quiet cobbled streets, no crowds, and Sacré-Cœur lit in early light. Café des Deux Moulins opens at 7am.",
      category: "culture",
      best_time: "Morning",
      suggested_time: "07:00",
    },
    {
      title: "Seine riverside at golden hour",
      description:
        "Pont Alexandre III at sunset is one of Paris's most iconic views. Walk west along the Left Bank toward the Eiffel Tower — entirely free.",
      category: "relaxation",
      best_time: "Evening",
      suggested_time: "19:00",
    },
    {
      title: "Musée d'Orsay — book online",
      description:
        "The Impressionist collection on Level 5 is unmissable. Pre-book tickets online (timed entry, no queue) and allow at least two hours.",
      category: "sightseeing",
      best_time: "Morning",
      suggested_time: "09:30",
    },
    {
      title: "Lunch prix fixe at a neighbourhood bistro",
      description:
        "Restaurants offer extraordinary value at lunch — two or three courses for €15–25. Better food, better price than dinner at the same table.",
      category: "food",
      best_time: "Afternoon",
      suggested_time: "12:30",
    },
    {
      title: "Canal Saint-Martin picnic walk",
      description:
        "Locals picnic along the iron footbridges and tree-lined banks of Canal Saint-Martin. Pick up provisions from a nearby épicerie and join them.",
      category: "relaxation",
      best_time: "Afternoon",
      suggested_time: "15:00",
    },
    {
      title: "Palais Royal gardens — free and serene",
      description:
        "Hidden behind the Louvre, these formal gardens are free, uncrowded, and beautiful. The colonnaded arcades have excellent independent boutiques.",
      category: "culture",
      best_time: "Afternoon",
      suggested_time: "14:00",
    },
    {
      title: "Sunday closures — plan ahead",
      description:
        "Many shops, some restaurants, and a few museums close on Sundays. Check opening hours on Saturday evening and have a backup plan ready.",
      category: "admin",
    },
    {
      title: "Café culture — order at the bar",
      description:
        "Standing at the zinc bar (comptoir) costs less than a table and is how Parisians do it. Un café = espresso, crème = white coffee.",
      category: "local-tip",
    },
  ],

  london: [
    {
      title: "Tap your bank card on the Tube",
      description:
        "Contactless and Apple/Google Pay apply the same daily and weekly fare caps as Oyster. No need to queue at the ticket machine.",
      category: "transport",
    },
    {
      title: "Borough Market for lunch (Thu–Sat)",
      description:
        "One of Europe's great food markets. Artisan bread, aged cheeses, and street food from every corner of the world. Arrive before 12:30pm.",
      category: "food",
      best_time: "Afternoon",
      suggested_time: "12:30",
    },
    {
      title: "London's major museums are free",
      description:
        "British Museum, Natural History, V&A, National Gallery, Tate Modern, and Science Museum — all free, no booking required. An extraordinary deal.",
      category: "culture",
      reason: "One of London's best-kept secrets",
    },
    {
      title: "Full English breakfast at a greasy spoon",
      description:
        "An honest, unhyped London experience. Bacon, eggs, beans, toast, and a builders' tea for under £10. Ask your hotel for the nearest one.",
      category: "food",
      best_time: "Morning",
      suggested_time: "08:30",
    },
    {
      title: "Night Tube runs Fri and Sat nights",
      description:
        "The Central, Victoria, Jubilee, Northern, and Piccadilly lines run 24 hours on Friday and Saturday nights — no need for a cab home.",
      category: "transport",
    },
    {
      title: "Columbia Road Flower Market (Sunday only)",
      description:
        "Open every Sunday 8am–3pm in East London. A densely packed street of flower stalls, independent shops, and the best people-watching in the city.",
      category: "sightseeing",
      best_time: "Morning",
      suggested_time: "09:00",
    },
    {
      title: "Afternoon tea — book well ahead",
      description:
        "Claridge's, The Ritz, and The Savoy book up weeks in advance. For a more affordable version, try Sketch or Bea's of Bloomsbury.",
      category: "relaxation",
      best_time: "Afternoon",
      suggested_time: "15:00",
    },
    {
      title: "Sunday roast at a proper pub",
      description:
        "A British institution: roast beef, Yorkshire pudding, roast potatoes, and gravy. Book a table — the best pubs fill completely by noon.",
      category: "food",
      best_time: "Afternoon",
      suggested_time: "13:00",
    },
    {
      title: "Pubs call last orders at 10:45pm",
      description:
        "Most pubs close at 11pm. 'Last orders' is announced 15 minutes before — this is your cue to get a final round in.",
      category: "local-tip",
    },
    {
      title: "Regent's Park or Hyde Park for a morning walk",
      description:
        "Both are enormous, beautifully kept, and completely free. Regent's Park has the rose garden; Hyde Park has the Serpentine Gallery.",
      category: "relaxation",
      best_time: "Morning",
      suggested_time: "08:30",
    },
    {
      title: "Black cab: yellow light on = available",
      description:
        "When the yellow sign is lit, hail it by raising your hand. Metered, licensed, and drivers memorise every street — no GPS needed.",
      category: "transport",
    },
  ],

  tokyo: [
    {
      title: "Get a Suica or Pasmo IC card",
      description:
        "Top it up at any station and tap in/out on all trains, subways, buses — and pay at convenience stores. Indispensable from day one.",
      category: "transport",
    },
    {
      title: "Senso-ji Temple before 7am",
      description:
        "The ancient Asakusa temple is fog-draped and peaceful at dawn, before the daytime crowds arrive. The Nakamise shopping street is also quiet.",
      category: "culture",
      best_time: "Morning",
      suggested_time: "06:30",
    },
    {
      title: "Ramen at Fuunji, Ichiran, or Afuri",
      description:
        "Fuunji for rich tsukemen, Ichiran for solo dining booths, Afuri for yuzu shio ramen. Three very different styles — each exceptional.",
      category: "food",
      best_time: "Lunch",
      suggested_time: "12:00",
    },
    {
      title: "Convenience stores are excellent here",
      description:
        "7-Eleven and Lawson sell hot onigiri, fresh sushi, great coffee, and ATMs that accept foreign cards. Use them freely — locals do.",
      category: "local-tip",
    },
    {
      title: "Shibuya crossing at dusk",
      description:
        "Best viewed from the Mag's Park observation deck or Starbucks across the intersection. Peak atmosphere between 6–8pm when the neon kicks in.",
      category: "sightseeing",
      best_time: "Evening",
      suggested_time: "18:30",
    },
    {
      title: "Conveyor belt sushi (kaiten-zushi)",
      description:
        "Fun, affordable, and surprisingly high quality. Look for Genki Sushi or Hamazushi — tablet ordering means no language barrier.",
      category: "food",
      best_time: "Lunch",
      suggested_time: "13:00",
    },
  ],

  lagos: [
    {
      title: "Use Bolt or inDrive — not street cabs",
      description:
        "Fixed-price apps are essential in Lagos. With unmetered taxis, agree a price before you get in — and always allow 2× your expected travel time.",
      category: "transport",
      reason: "Lagos traffic is notoriously unpredictable",
    },
    {
      title: "Reconfirm every meeting 24h before",
      description:
        "Lagos schedules shift constantly. A quick call or WhatsApp message the evening before saves wasted journeys and rescheduled days.",
      category: "admin",
    },
    {
      title: "Dinner in Lekki Phase 1 or Victoria Island",
      description:
        "NOK by Alara, Nok-Nok, Island Grill, and Izanagi are consistently strong. Book ahead on Thursday to Saturday — they fill fast.",
      category: "food",
      best_time: "Evening",
      suggested_time: "19:30",
    },
    {
      title: "Carry small Naira notes at all times",
      description:
        "Many vendors, market traders, and roadside drivers prefer exact change. Keep ₦100–₦500 notes in a separate pocket and top up at ATMs regularly.",
      category: "local-tip",
    },
    {
      title: "Travel between 10am and 2pm",
      description:
        "Morning rush (7–9am) and evening go-slow (4–8pm) can add 2+ hours to any journey on Lagos roads. Schedule important trips in that midday window.",
      category: "transport",
    },
    {
      title: "Suya at a trusted roadside stall",
      description:
        "Spiced grilled beef skewers — the definitive Lagos street food. Ask a local or your hotel concierge for the best stall nearby rather than relying on apps.",
      category: "food",
      best_time: "Evening",
      suggested_time: "20:00",
    },
    {
      title: "Lagos nightlife starts very late",
      description:
        "Clubs and upscale bars don't fill until midnight or later. Dinner at 9pm, bar at 11pm, club after — plan your next day around a late start.",
      category: "local-tip",
    },
    {
      title: "Dress smartly — smart casual is the floor",
      description:
        "Lagos has high fashion standards. Most restaurants, lounges, and meeting venues expect smart casual at minimum. Avoid overly casual resort wear.",
      category: "culture",
    },
    {
      title: "Have USD or EUR as a backup",
      description:
        "Many hotels, upscale restaurants, and some vendors accept US dollars or euros directly. Useful when ATMs are out of service or Naira liquidity is tight.",
      category: "admin",
    },
    {
      title: "Tarkwa Bay beach via speedboat",
      description:
        "A peaceful island beach accessible only by a 15-minute speedboat from Bar Beach. Far quieter than Lagos mainland beaches — a genuine escape.",
      category: "relaxation",
      best_time: "Morning",
      suggested_time: "10:00",
    },
    {
      title: "Jollof rice — try the local debate firsthand",
      description:
        "Every Lagos local has an opinion on Nigerian vs. Ghanaian jollof. Ask your host or driver for their favourite spot and go with their pick.",
      category: "food",
      best_time: "Afternoon",
      suggested_time: "13:00",
    },
  ],

  rome: [
    {
      title: "Pre-book Vatican and Colosseum tickets",
      description:
        "Both sell out daily — weeks in advance during peak season. No pre-booking means queuing for hours or being turned away entirely.",
      category: "admin",
    },
    {
      title: "Aperitivo in Trastevere at dusk",
      description:
        "Many bars offer free cicchetti (snacks) with drinks from 6–8pm. Wander the neighbourhood and pick the bar that looks most alive.",
      category: "food",
      best_time: "Evening",
      suggested_time: "18:30",
    },
    {
      title: "Dress modestly for all churches",
      description:
        "Knees and shoulders must be covered at the Vatican, Trevi Fountain area basilicas, and most major churches. A light scarf works perfectly.",
      category: "culture",
    },
    {
      title: "Artisan gelato — know the signs",
      description:
        "Avoid gelato piled high in metal cans. Real gelaterie keep it flat and covered. Artico, Giolitti, and Fatamorgana are reliable benchmarks.",
      category: "food",
    },
    {
      title: "Roma Pass for metro and museums",
      description:
        "48h or 72h covers metro, buses, and select museum entries. Worth it from day 2 if you plan to visit more than two paid attractions.",
      category: "transport",
    },
  ],

  "new york": [
    {
      title: "Tap to pay on the subway — skip the machine",
      description:
        "Contactless cards and Apple/Google Pay work on every turnstile. A 7-day unlimited MetroCard breaks even from day 3 onwards.",
      category: "transport",
    },
    {
      title: "A real New York bagel",
      description:
        "Ess-a-Bagel or Murray's Bagels — lox and cream cheese, folded in half, eaten standing. Hotel bagels are not an acceptable substitute.",
      category: "food",
      best_time: "Morning",
      suggested_time: "08:30",
    },
    {
      title: "Brooklyn Bridge walk — start from DUMBO",
      description:
        "The Manhattan skyline view from the Brooklyn side is spectacular, especially in morning light. Free, 30 minutes one way.",
      category: "sightseeing",
      best_time: "Morning",
      suggested_time: "08:00",
    },
    {
      title: "The High Line in late afternoon",
      description:
        "An elevated park above the Meatpacking District, best in golden-hour light. Walk it south to north for the best city views. Free.",
      category: "relaxation",
      best_time: "Afternoon",
      suggested_time: "16:00",
    },
    {
      title: "The Met is pay-what-you-wish",
      description:
        "The suggested fee is $30 but any amount is accepted for New York State residents and US students. The suggested fee applies to most visitors — worth every cent.",
      category: "culture",
      best_time: "Morning",
      suggested_time: "10:00",
    },
    {
      title: "Staten Island Ferry — free Statue of Liberty views",
      description:
        "The free 25-minute ferry runs 24/7 and passes right by the Statue of Liberty. Board at Whitehall Terminal in Lower Manhattan.",
      category: "sightseeing",
      best_time: "Afternoon",
      suggested_time: "14:00",
    },
    {
      title: "Pizza by the slice — fold it lengthwise",
      description:
        "Joe's Pizza in the West Village or Di Fara in Brooklyn for the full experience. Fold the slice lengthwise and eat standing. This is correct.",
      category: "food",
      best_time: "Afternoon",
      suggested_time: "13:30",
    },
    {
      title: "CitiBike for short cross-town hops",
      description:
        "A day pass or monthly membership makes bike share faster than taxis for under 3-mile journeys. Docks are everywhere below 96th Street.",
      category: "transport",
    },
    {
      title: "Tip 20% at restaurants — it's expected",
      description:
        "20% is the standard tip at sit-down restaurants; 18% at bars. It's not optional — servers are paid a sub-minimum tipped wage.",
      category: "local-tip",
    },
    {
      title: "Rooftop bar happy hour — weekday windows",
      description:
        "Many Meatpacking and Midtown rooftops run 5–7pm weekday specials. Le Bain at The Standard and 230 Fifth are both reliable choices.",
      category: "food",
      best_time: "Evening",
      suggested_time: "17:30",
    },
    {
      title: "Prospect Park or Central Park — pick your borough",
      description:
        "Central Park is iconic; Prospect Park in Brooklyn feels more local and is less crowded. Both are free, massive, and worth a morning.",
      category: "relaxation",
      best_time: "Morning",
      suggested_time: "09:00",
    },
  ],

  dubai: [
    {
      title: "Download Careem before landing",
      description:
        "Careem and Uber both work well. Avoid unmetered taxis — if you must take one, agree on the fare before you get in.",
      category: "transport",
    },
    {
      title: "Dress modestly in public and malls",
      description:
        "Shoulders and knees covered is the expectation in all public areas. Swimwear is restricted to beach and pool areas only.",
      category: "culture",
    },
    {
      title: "Plan outdoor time for morning or after 4pm",
      description:
        "Midday heat from May–September is genuinely brutal. Schedule outdoor sightseeing early or late — carry water regardless of season.",
      category: "weather-aware",
      reason: "Based on Dubai's desert climate",
    },
    {
      title: "Dubai Marina walk after sunset",
      description:
        "The waterfront promenade is most beautiful after dark when the towers and lights reflect off the water. Walk the full 7km loop or take it in sections.",
      category: "sightseeing",
      best_time: "Evening",
      suggested_time: "19:30",
    },
    {
      title: "Friday brunch — a Dubai institution",
      description:
        "Lavish all-inclusive hotel brunches are a weekly ritual. Book ahead: Jetty Lounge, Nasimi Beach, and Bab Al Bahr are perennial favourites.",
      category: "food",
      best_time: "Afternoon",
      suggested_time: "13:00",
    },
    {
      title: "Museum of the Future — book in advance",
      description:
        "One of the most architecturally stunning buildings on earth. Tickets sell quickly — book online before your trip for a timed entry.",
      category: "sightseeing",
      best_time: "Morning",
      suggested_time: "09:00",
    },
    {
      title: "Al Fahidi Historical Neighbourhood",
      description:
        "Dubai's original wind-tower district is a 20-minute taxi from Downtown. Free to wander, with small galleries and the Dubai Museum nearby.",
      category: "culture",
      best_time: "Morning",
      suggested_time: "09:30",
    },
    {
      title: "Gold Souk and Spice Souk — go early",
      description:
        "Both souks are in Deira, across the Creek from Downtown. Take an abra (water taxi) across for AED 1. Arrive before 10am before the heat sets in.",
      category: "local-tip",
      best_time: "Morning",
      suggested_time: "09:00",
    },
    {
      title: "No public displays of affection",
      description:
        "PDA is technically illegal in public spaces in the UAE. Holding hands is generally accepted; anything beyond that risks unwanted attention.",
      category: "admin",
    },
    {
      title: "JBR public beach — free and well-maintained",
      description:
        "Jumeirah Beach Residence has a free, clean public beach with showers and facilities. Far less crowded than hotel-only stretches further south.",
      category: "relaxation",
      best_time: "Morning",
      suggested_time: "08:00",
    },
  ],

  bali: [
    {
      title: "Wear a sarong at temples",
      description:
        "Required at all temple entrances. Many temples lend them, but buying an inexpensive one from a market is easier and you keep it.",
      category: "culture",
    },
    {
      title: "Hire a private driver for day trips",
      description:
        "Rp 300k–500k/day for a driver with car is the most practical way to reach Ubud, Uluwatu, and the rice terraces in comfort.",
      category: "transport",
    },
    {
      title: "Sunset at Tanah Lot or Uluwatu",
      description:
        "Both sea temples turn gold at sunset. Book the Kecak fire dance at Uluwatu cliff-top in advance — it sells out early.",
      category: "relaxation",
      best_time: "Evening",
      suggested_time: "18:00",
    },
    {
      title: "Eat at a local warung",
      description:
        "Family-run warungs serve the best nasi goreng, mie goreng, and satay at a fraction of the tourist restaurant price. Follow the locals.",
      category: "food",
      best_time: "Lunch",
      suggested_time: "12:30",
    },
    {
      title: "Negotiate at markets — it's expected",
      description:
        "Start at 40–50% of the asking price and meet in the middle with a smile. Friendly haggling is a normal part of the shopping culture.",
      category: "local-tip",
    },
  ],

  amsterdam: [
    {
      title: "Book Anne Frank House well in advance",
      description:
        "No same-day or walk-in tickets — it sells out completely. Book online as far ahead as possible, especially in summer.",
      category: "admin",
    },
    {
      title: "Rent a bike — it's how the city works",
      description:
        "MacBike or Donkey Republic for rentals. Stay in the marked lanes, follow traffic signals, and always use a lock — theft is common.",
      category: "transport",
      best_time: "Daytime",
      suggested_time: "09:00",
    },
    {
      title: "GVB day pass for trams and buses",
      description:
        "24h, 48h, and 72h passes cover all trams, buses, and metro. Useful for rainy days when you're not cycling.",
      category: "transport",
    },
    {
      title: "Stroopwafels warm from a market stall",
      description:
        "Try one fresh and warm at the Albert Cuyp Market or Noordermarkt. Infinitely better than the factory-sealed versions in any shop.",
      category: "food",
    },
    {
      title: "Canal boat rental at golden hour",
      description:
        "Rent a small electric pedal boat (no licence needed, very affordable) and explore the canals at your own pace at sunset.",
      category: "relaxation",
      best_time: "Evening",
      suggested_time: "18:30",
    },
  ],

  singapore: [
    {
      title: "Eat at a hawker centre",
      description:
        "Maxwell Food Centre or Lau Pa Sat for lunch — Michelin-starred street food at S$5–10. Air-conditioned, clean, and genuinely excellent.",
      category: "food",
      best_time: "Lunch",
      suggested_time: "12:00",
    },
    {
      title: "EZ-Link card for MRT and buses",
      description:
        "Singapore's metro is world-class. Top up the EZ-Link card at any station — it covers trains, buses, and even some shops.",
      category: "transport",
    },
    {
      title: "Gardens by the Bay — free Supertree Grove",
      description:
        "The Supertree Grove and elevated walkways are free. Pay only for the cooled conservatories. Evening light show at 7:45pm and 8:45pm daily.",
      category: "sightseeing",
      best_time: "Evening",
      suggested_time: "19:30",
    },
    {
      title: "Singapore's strict laws — a quick note",
      description:
        "No gum, no eating or drinking on MRT, jaywalking fines are real. Easy to adjust to once you know — just good to be aware upfront.",
      category: "admin",
    },
  ],

  istanbul: [
    {
      title: "Istanbulkart for all transport",
      description:
        "Buy one at any airport kiosk — works on metro, tram, ferry, and bus. Shareable between travellers, and very cheap per journey.",
      category: "transport",
    },
    {
      title: "Dress modestly for mosques",
      description:
        "Shoes off at the entrance, shoulders and knees covered. Scarves and coverings are provided at Hagia Sophia and the Blue Mosque for free.",
      category: "culture",
    },
    {
      title: "Turkish breakfast at a lokanta",
      description:
        "A proper Turkish breakfast is an event: cheese, olives, eggs, honey, bread, fresh tomatoes, and endless tea. Kadıköy for the local version.",
      category: "food",
      best_time: "Morning",
      suggested_time: "09:00",
    },
    {
      title: "Bosphorus public ferry at dusk",
      description:
        "The ferry between Beşiktaş and Üsküdar costs ₺30 and offers a stunning view of the city at golden hour. Takes 15 minutes each way.",
      category: "sightseeing",
      best_time: "Evening",
      suggested_time: "18:00",
    },
    {
      title: "Grand Bazaar — arrive with a list",
      description:
        "Overwhelming without a plan. Know what you want — spices, textiles, ceramics, lanterns — and negotiate confidently. Start at 50% of asking price.",
      category: "local-tip",
      best_time: "Morning",
      suggested_time: "10:00",
    },
  ],

  lisbon: [
    {
      title: "Tram 28 — board at Martim Moniz",
      description:
        "Get on at the start of the line to guarantee a seat. The most scenic tram ride in Europe winds through the historic hillside neighbourhoods.",
      category: "sightseeing",
      best_time: "Morning",
      suggested_time: "09:00",
    },
    {
      title: "Pastéis de nata at Pastéis de Belém",
      description:
        "The original custard tarts since 1837 — still made to a secret recipe. Queue is long but moves fast. Eat them warm at the counter.",
      category: "food",
      best_time: "Morning",
      suggested_time: "10:00",
    },
    {
      title: "Fado show in Alfama — book a table",
      description:
        "Book at a tasca that includes dinner and live Fado. The neighbourhood is quietest and most atmospheric after 9pm.",
      category: "culture",
      best_time: "Evening",
      suggested_time: "20:00",
    },
    {
      title: "Viva Viagem card for metro and trams",
      description:
        "Reloadable card covers metro, trams (including 28E), buses, and some ferry routes. Significantly cheaper than single tickets.",
      category: "transport",
    },
  ],
};

// ─── Destination aliases ───────────────────────────────────────────────────────
//
// Maps common shorthand, abbreviations, and alternate spellings to the
// canonical destination key used in DESTINATION_POOL above.

const DESTINATION_ALIASES: Record<string, string> = {
  // New York
  nyc: "new york",
  manhattan: "new york",
  brooklyn: "new york",
  queens: "new york",
  bronx: "new york",
  // Barcelona
  barca: "barcelona",
  bcn: "barcelona",
  // London
  ldn: "london",
  // Paris
  île: "paris",
  // Dubai
  uae: "dubai",
  // Bali
  ubud: "bali",
  seminyak: "bali",
  canggu: "bali",
  uluwatu: "bali",
  // Amsterdam
  ams: "amsterdam",
  // Singapore
  sg: "singapore",
  // Istanbul
  constantinople: "istanbul",
  // Lisbon
  lx: "lisbon",
  lisboa: "lisbon",
};

// ─── Generic fallback pool ─────────────────────────────────────────────────────
//
// Used when no destination is matched from the trip title.
// Keep this pool varied across all categories so the diversity algorithm
// produces a well-rounded set of 5 suggestions.

const GENERIC_POOL: RawSuggestion[] = [
  {
    title: "Research your airport transfer before landing",
    description:
      "Know the train, bus, or taxi options and their cost before you arrive. First-arrival confusion is easily avoided with 10 minutes of prep.",
    category: "transport",
  },
  {
    title: "Ask your accommodation for local restaurant picks",
    description:
      "Hotel concierges and Airbnb hosts know the neighbourhood spots that never appear in any guidebook — and they're usually right.",
    category: "food",
  },
  {
    title: "Book the most popular attractions in advance",
    description:
      "Top museums and experiences at major destinations sell out. Check availability online 1–2 weeks before — free entry sites often still require timed slots.",
    category: "sightseeing",
  },
  {
    title: "Download offline maps before you go",
    description:
      "Save the destination in Google Maps or Maps.me offline. Works without data and is invaluable the moment you land.",
    category: "admin",
  },
  {
    title: "Notify your bank before travelling",
    description:
      "Avoid a card block mid-trip by telling your bank which countries you're visiting. Takes 2 minutes online or via your banking app.",
    category: "admin",
  },
  {
    title: "Carry a small cash reserve in local currency",
    description:
      "Markets, street food stalls, and small restaurants almost always prefer cash. Exchange a modest amount on arrival rather than at the airport.",
    category: "local-tip",
  },
  {
    title: "Arrive with mobile data already sorted",
    description:
      "Having maps, ride-hailing, and translation apps working from the moment you land removes a surprising amount of first-day friction.",
    category: "admin",
  },
  {
    title: "Walk the city's main waterfront or promenade",
    description:
      "Most cities have a waterfront, riverside, or seafront promenade. Free, orienting, and usually the best first impression of any destination.",
    category: "sightseeing",
  },
  {
    title: "Find a free walking tour on your first morning",
    description:
      "Most major cities have tip-based free walking tours departing from the main square. An excellent way to orient yourself and get local recommendations.",
    category: "culture",
  },
  {
    title: "Learn 5 words in the local language",
    description:
      "Please, thank you, excuse me, hello, and where is — any attempt in the local language is warmly received almost everywhere.",
    category: "local-tip",
  },
  {
    title: "Find the nearest park or public garden",
    description:
      "Every city has green space worth exploring. A morning walk through a local park is often more memorable than a second museum visit.",
    category: "relaxation",
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

  // 1 — Check direct match against pool keys
  const direct = Object.keys(DESTINATION_POOL).find((dest) =>
    lower.includes(dest)
  );
  if (direct) return direct;

  // 2 — Check alias map, then resolve to the canonical pool key
  const aliasMatch = Object.keys(DESTINATION_ALIASES).find((alias) =>
    lower.includes(alias)
  );
  if (aliasMatch) {
    const canonical = DESTINATION_ALIASES[aliasMatch];
    return canonical in DESTINATION_POOL ? canonical : null;
  }

  return null;
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
