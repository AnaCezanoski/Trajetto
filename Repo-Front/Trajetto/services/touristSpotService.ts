// services/touristSpotService.ts
// Sem mudanças na interface — o app continua chamando seu backend normalmente

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

export interface TouristSpot {
  xid: string;
  name: string;
  kinds: string;
  point: {
    lat: number;
    lon: number;
  };
}

export interface SearchOptions {
  radius?: number;
}

export async function searchByCity(
  cityName: string,
  options: SearchOptions = {}
): Promise<TouristSpot[]> {
  const { radius = 10000 } = options;

  const params = new URLSearchParams({
    city: cityName,
    radius: String(radius),
  });

  const response = await fetch(`${BACKEND_URL}/api/tourist-spots?${params}`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar pontos turísticos: ${response.status}`);
  }

  return response.json() as Promise<TouristSpot[]>;
}