import { api } from './api';

export interface Place {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  profiles: string[];
  openingHours: string;
  category: string;
  fee: string;
}

export const placesService = {
  getAll: async (search?: string, category?: string): Promise<Place[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    const res = await api.get('/places', { params });
    return res.data;
  },

  getCategories: async (): Promise<string[]> => {
    const res = await api.get('/places/categories');
    return res.data;
  },
};