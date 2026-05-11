type GeocodeResult = {
  lat: number;
  lng: number;
} | null;

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("[GEOCODING] GOOGLE_MAPS_API_KEY non configurata — coordinate impostate a 0,0");
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error("[GEOCODING] Errore HTTP:", response.status);
      return null;
    }

    const data = await response.json() as {
      status: string;
      results: { geometry: { location: { lat: number; lng: number } } }[];
    };

    if (data.status !== "OK" || data.results.length === 0) {
      console.warn("[GEOCODING] Nessun risultato per:", address, "— status:", data.status);
      return null;
    }

    const { lat, lng } = data.results[0].geometry.location;
    console.log("[GEOCODING] Coordinate trovate:", { address, lat, lng });
    return { lat, lng };
  } catch (error) {
    console.error("[GEOCODING] Errore durante il geocoding:", error);
    return null;
  }
}
