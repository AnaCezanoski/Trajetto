// Pontos turísticos vindos do backend.

import { api } from './api';

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

const DEFAULT_RADIUS = 10000;

export async function searchByCity(
  cityName: string,
  options: SearchOptions = {}
): Promise<TouristSpot[]> {
  const { radius = DEFAULT_RADIUS } = options;

  const response = await api.get<TouristSpot[]>('/api/tourist-spots', {
    params: { city: cityName, radius },
  });

  return response.data;
}

export const touristSpotService = { searchByCity };
