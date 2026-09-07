export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Bounding box aproximado alrededor de Río Cuarto (west, south, east, north)
// para que Nominatim no confunda la dirección con una de otra ciudad.
const RIO_CUARTO_VIEWBOX = "-64.55,-33.25,-64.15,-33.00";

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  const query = `${address}, Río Cuarto, Córdoba, Argentina`;
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
    countrycodes: "ar",
    viewbox: RIO_CUARTO_VIEWBOX,
    bounded: "1",
  });

  try {
    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        // Nominatim exige identificar la app que hace las consultas (política de uso)
        "User-Agent": "DonaRiosAlmacen/1.0",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { lat: string; lon: string; display_name: string }[];
    if (!data.length) return null;

    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
  } catch {
    return null;
  }
}