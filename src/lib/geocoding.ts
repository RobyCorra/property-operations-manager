type GeocodeResult = {
  lat: number;
  lng: number;
} | null;

// Geocodifica un indirizzo in coordinate.
//
// Strategia: se e' configurata GOOGLE_MAPS_API_KEY si usa Google; altrimenti
// (e come fallback in caso di errore) si usa Nominatim di OpenStreetMap, che
// e' gratuito e non richiede chiave — coerente con la mappa OSM dell'app.
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const query = (address ?? "").trim();
  if (!query) return null;

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    const viaGoogle = await geocodeWithGoogle(query, apiKey);
    if (viaGoogle) return viaGoogle;
    console.warn("[GEOCODING] Google senza risultati — provo con OpenStreetMap");
  }

  return geocodeWithNominatim(query);
}

async function geocodeWithGoogle(address: string, apiKey: string): Promise<GeocodeResult> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error("[GEOCODING] Google errore HTTP:", response.status);
      return null;
    }
    const data = (await response.json()) as {
      status: string;
      results: { geometry: { location: { lat: number; lng: number } } }[];
    };
    if (data.status !== "OK" || data.results.length === 0) {
      console.warn("[GEOCODING] Google nessun risultato per:", address, "— status:", data.status);
      return null;
    }
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  } catch (error) {
    console.error("[GEOCODING] Google errore:", error);
    return null;
  }
}

// Nominatim (OpenStreetMap). Richiede uno User-Agent descrittivo e prevede un
// limite di ~1 richiesta/secondo: adeguato all'uso occasionale dell'app
// (creazione/modifica di strutture e appartamenti).
async function geocodeWithNominatim(address: string): Promise<GeocodeResult> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "PropOps/1.0 (property-operations-manager)",
        "Accept-Language": "it",
      },
    });
    if (!response.ok) {
      console.error("[GEOCODING] Nominatim errore HTTP:", response.status);
      return null;
    }
    const data = (await response.json()) as { lat: string; lon: string }[];
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("[GEOCODING] Nominatim nessun risultato per:", address);
      return null;
    }
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    console.log("[GEOCODING] Coordinate trovate (OSM):", { address, lat, lng });
    return { lat, lng };
  } catch (error) {
    console.error("[GEOCODING] Nominatim errore:", error);
    return null;
  }
}
