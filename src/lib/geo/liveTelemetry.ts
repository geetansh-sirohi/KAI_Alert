export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

export interface LiveTelemetryData {
  windSpeedKmh: number;
  surfacePressureHpa: number;
  windGustsKmh: number;
  temperatureC: number;
  elevationMsl: number;
  weatherCode: number;
}

export interface UserLiveLocationResult {
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  elevation: number;
  liveWind: number;
  livePressure: number;
  liveGusts: number;
  temperature: number;
  isSafe: boolean;
}

export async function searchLocation(query: string): Promise<NominatimResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          "User-Agent": "KAIAlert/3.0 (DisasterResponseSystem)",
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data;
  } catch {
    return [];
  }
}

export async function fetchLiveTelemetry(lat: number, lon: number): Promise<LiveTelemetryData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code,wind_gusts_10m`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Open-Meteo HTTP error");
    const data = await res.json();
    const current = data.current || {};
    return {
      windSpeedKmh: current.wind_speed_10m ?? 14,
      surfacePressureHpa: current.surface_pressure ?? 1012,
      windGustsKmh: current.wind_gusts_10m ?? 20,
      temperatureC: current.temperature_2m ?? 28,
      elevationMsl: data.elevation ?? 12,
      weatherCode: current.weather_code ?? 0,
    };
  } catch {
    return {
      windSpeedKmh: 14,
      surfacePressureHpa: 1012,
      windGustsKmh: 20,
      temperatureC: 28,
      elevationMsl: 12,
      weatherCode: 0,
    };
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ name: string; city: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "KAIAlert/3.0 (DisasterResponseSystem)",
        },
      }
    );
    if (!res.ok) throw new Error("Nominatim error");
    const data = await res.json();
    const addr = data.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || "Local Region";
    const displayName = data.display_name ? data.display_name.split(",").slice(0, 3).join(",") : city;
    return { name: displayName, city };
  } catch {
    return { name: "Current Location", city: "Local Region" };
  }
}

export async function fetchDeviceLiveLocation(): Promise<UserLiveLocationResult> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const geo = await reverseGeocode(lat, lon);
          const telemetry = await fetchLiveTelemetry(lat, lon);
          const isSafe = telemetry.windSpeedKmh < 45 && telemetry.surfacePressureHpa > 995;
          resolve({
            name: geo.name,
            city: geo.city,
            country: "India",
            lat,
            lon,
            elevation: telemetry.elevationMsl,
            liveWind: telemetry.windSpeedKmh,
            livePressure: telemetry.surfacePressureHpa,
            liveGusts: telemetry.windGustsKmh,
            temperature: telemetry.temperatureC,
            isSafe,
          });
        },
        async () => {
          // Fallback to IP geolocation if browser location denied/disabled
          try {
            const ipRes = await fetch("https://ipapi.co/json/");
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              const lat = ipData.latitude || 28.6139;
              const lon = ipData.longitude || 77.2090;
              const city = ipData.city || "New Delhi";
              const telemetry = await fetchLiveTelemetry(lat, lon);
              const isSafe = telemetry.windSpeedKmh < 45 && telemetry.surfacePressureHpa > 995;
              resolve({
                name: `${city}, ${ipData.region || ""}`,
                city,
                country: ipData.country_name || "India",
                lat,
                lon,
                elevation: telemetry.elevationMsl,
                liveWind: telemetry.windSpeedKmh,
                livePressure: telemetry.surfacePressureHpa,
                liveGusts: telemetry.windGustsKmh,
                temperature: telemetry.temperatureC,
                isSafe,
              });
              return;
            }
          } catch {
            // Default Delhi coordinates if IP fails
          }
          const lat = 28.6139;
          const lon = 77.2090;
          const telemetry = await fetchLiveTelemetry(lat, lon);
          resolve({
            name: "New Delhi, India",
            city: "New Delhi",
            country: "India",
            lat,
            lon,
            elevation: telemetry.elevationMsl,
            liveWind: telemetry.windSpeedKmh,
            livePressure: telemetry.surfacePressureHpa,
            liveGusts: telemetry.windGustsKmh,
            temperature: telemetry.temperatureC,
            isSafe: true,
          });
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      // Fallback
      resolve({
        name: "New Delhi, India",
        city: "New Delhi",
        country: "India",
        lat: 28.6139,
        lon: 77.2090,
        elevation: 216,
        liveWind: 14,
        livePressure: 1012,
        liveGusts: 20,
        temperature: 28,
        isSafe: true,
      });
    }
  });
}
