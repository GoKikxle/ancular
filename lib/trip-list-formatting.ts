export const COUNTRY_ABBR: Record<string, string> = {
  nigeria: "NGA",
  niger: "NER",
  "united states": "USA",
  "united states of america": "USA",
  us: "USA",
  usa: "USA",
  "united kingdom": "GBR",
  uk: "GBR",
  england: "ENG",
  scotland: "SCO",
  france: "FRA",
  germany: "DEU",
  italy: "ITA",
  spain: "ESP",
  portugal: "PRT",
  netherlands: "NLD",
  belgium: "BEL",
  switzerland: "CHE",
  austria: "AUT",
  sweden: "SWE",
  norway: "NOR",
  denmark: "DNK",
  finland: "FIN",
  poland: "POL",
  "czech republic": "CZE",
  czechia: "CZE",
  hungary: "HUN",
  romania: "ROU",
  greece: "GRC",
  turkey: "TUR",
  russia: "RUS",
  ukraine: "UKR",
  croatia: "HRV",
  serbia: "SRB",
  japan: "JPN",
  china: "CHN",
  "south korea": "KOR",
  korea: "KOR",
  india: "IND",
  thailand: "THA",
  vietnam: "VNM",
  indonesia: "IDN",
  malaysia: "MYS",
  singapore: "SGP",
  philippines: "PHL",
  cambodia: "KHM",
  myanmar: "MMR",
  laos: "LAO",
  bangladesh: "BGD",
  "sri lanka": "LKA",
  nepal: "NPL",
  pakistan: "PAK",
  australia: "AUS",
  "new zealand": "NZL",
  "south africa": "ZAF",
  kenya: "KEN",
  ghana: "GHA",
  egypt: "EGY",
  morocco: "MAR",
  ethiopia: "ETH",
  tanzania: "TZA",
  senegal: "SEN",
  brazil: "BRA",
  argentina: "ARG",
  colombia: "COL",
  peru: "PER",
  chile: "CHL",
  mexico: "MEX",
  canada: "CAN",
  "united arab emirates": "UAE",
  uae: "UAE",
  "saudi arabia": "SAU",
  israel: "ISR",
  jordan: "JOR",
  lebanon: "LBN",
  qatar: "QAT",
  kuwait: "KWT",
  bahrain: "BHR",
  oman: "OMN",
  cuba: "CUB",
  jamaica: "JAM",
  iceland: "ISL",
  ireland: "IRL",
  malta: "MLT",
  luxembourg: "LUX",
};

export function formatCity(destination: string | null | undefined, title: string): string {
  const dest = destination?.trim();
  if (!dest) return title.toUpperCase();
  const parts = dest
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const city = parts[0].toUpperCase();
  if (parts.length === 1) return `${city}.`;
  const rawCountry = parts[parts.length - 1].toLowerCase();
  const abbr = COUNTRY_ABBR[rawCountry] ?? rawCountry.slice(0, 3).toUpperCase();
  return `${city}, ${abbr}.`;
}

export function formatCardDate(start: string | null, end: string | null): string {
  if (!start) return "";
  const parse = (iso: string) => new Date(`${iso}T12:00:00`);
  const fmtPart = (d: Date) => {
    const day = String(d.getDate()).padStart(2, "0");
    const mon = d.toLocaleDateString("en-US", { month: "short" });
    return `${day} ${mon}`;
  };
  const s = parse(start);
  if (!end) return `${fmtPart(s)}, ${s.getFullYear()}`;
  const e = parse(end);
  return `${fmtPart(s)} - ${fmtPart(e)}, ${e.getFullYear()}`;
}

export function formatRowDate(start: string | null, end: string | null): string {
  if (!start) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(`${start}T00:00:00`);
  const diffDays = Math.ceil((startDate.getTime() - today.getTime()) / 86400000);

  if (diffDays >= 0 && diffDays <= 6) {
    return startDate.toLocaleDateString("en-US", { weekday: "short" });
  }
  const day = String(startDate.getDate()).padStart(2, "0");
  const mon = startDate.toLocaleDateString("en-US", { month: "short" });
  return `${day} ${mon}`;
}

export function daysUntil(startDate: string | null): number {
  if (!startDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(`${startDate}T00:00:00`);
  return Math.max(0, Math.ceil((start.getTime() - today.getTime()) / 86400000));
}
