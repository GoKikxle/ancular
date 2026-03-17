/**
 * Live weather via Open-Meteo (no API key required).
 *
 * Two-step flow:
 *   1. Geocode destination string → lat, lon, resolved place name
 *   2. Fetch current weather from Forecast API
 *
 * All fetches are server-side. No data is stored in the database for MVP.
 */

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// ─── Geocoding result ──────────────────────────────────────────────────────────

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
};

/**
 * Geocodes a destination string using Open-Meteo Geocoding API.
 *
 * @param destination - User-typed destination, e.g. "Barcelona, Spain"
 * @returns Resolved coordinates and place name, or null if no match / empty input
 */
export async function geocodeDestination(
  destination: string | null | undefined
): Promise<GeocodeResult | null> {
  const query = destination?.trim();
  if (!query || query.length < 2) return null;

  try {
    const url = new URL(GEOCODING_URL);
    url.searchParams.set("name", query);
    url.searchParams.set("count", "1");
    url.searchParams.set("language", "en");

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Geocoding results are stable
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { results?: Array<{ latitude: number; longitude: number; name: string; country?: string; country_code?: string }> };
    const first = data.results?.[0];
    if (!first) return null;

    return {
      latitude: first.latitude,
      longitude: first.longitude,
      name: first.name,
      country: first.country ?? first.country_code ?? "",
    };
  } catch {
    return null;
  }
}

// ─── Weather fetch ─────────────────────────────────────────────────────────────

export type WeatherResult = {
  temperatureCelsius: number;
  weatherCode: number;
  conditionLabel: string;
  summary: string;
};

/**
 * Maps Open-Meteo WMO weather codes to human-readable labels.
 * See: https://open-meteo.com/en/docs#weathervariables
 */
export function weatherCodeToLabel(code: number): string {
  const map: Record<number, string> = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return map[code] ?? "Unknown";
}

/**
 * Fetches current weather for a latitude/longitude using Open-Meteo Forecast API.
 *
 * @param latitude - WGS84 latitude
 * @param longitude - WGS84 longitude
 * @returns Temperature, weather code, condition label, and a summary string
 */
export async function fetchWeather(
  latitude: number,
  longitude: number
): Promise<WeatherResult | null> {
  try {
    const url = new URL(FORECAST_URL);
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("current", "temperature_2m,weather_code");
    url.searchParams.set("timezone", "auto");

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 }, // 5 min cache
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      current?: {
        temperature_2m?: number;
        weather_code?: number;
      };
    };

    const temp = data.current?.temperature_2m;
    const code = data.current?.weather_code ?? 0;

    if (temp === undefined) return null;

    const conditionLabel = weatherCodeToLabel(code);
    const summary = `${Math.round(temp)}°C · ${conditionLabel}`;

    return {
      temperatureCelsius: temp,
      weatherCode: code,
      conditionLabel,
      summary,
    };
  } catch {
    return null;
  }
}

// ─── Orchestration ────────────────────────────────────────────────────────────

export type LiveWeatherResult =
  | { ok: true; summary: string; note: string; placeName: string }
  | { ok: false; reason: "no_destination" | "geocode_failed" | "weather_failed" };

/**
 * Fetches live weather for a trip destination.
 *
 * Flow:
 *   1. If no destination → { ok: false, reason: "no_destination" }
 *   2. Geocode destination → if null → { ok: false, reason: "geocode_failed" }
 *   3. Fetch weather for lat/lon → if null → { ok: false, reason: "weather_failed" }
 *   4. Return summary + note for display
 */
export async function getWeatherForDestination(
  destination: string | null | undefined
): Promise<LiveWeatherResult> {
  if (!destination?.trim()) {
    return { ok: false, reason: "no_destination" };
  }

  const geo = await geocodeDestination(destination);
  if (!geo) return { ok: false, reason: "geocode_failed" };

  const weather = await fetchWeather(geo.latitude, geo.longitude);
  if (!weather) return { ok: false, reason: "weather_failed" };

  const placeLabel = geo.country ? `${geo.name}, ${geo.country}` : geo.name;

  return {
    ok: true,
    summary: weather.summary,
    note: `Current conditions for ${placeLabel}`,
    placeName: placeLabel,
  };
}
