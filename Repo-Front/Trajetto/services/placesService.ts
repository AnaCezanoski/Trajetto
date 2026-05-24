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

export interface PlacesFilter {
  search?: string;
  category?: string;
  fee?: 'yes' | 'no' | '';
  hasHours?: boolean;
  profile?: string;
  lat?: number;
  lng?: number;
  maxDistance?: number;
}

export const placesService = {
  getAll: async (filter: PlacesFilter = {}): Promise<Place[]> => {
    const params: Record<string, any> = {};
    if (filter.search)       params.search      = filter.search;
    if (filter.category)     params.category    = filter.category;
    if (filter.fee)          params.fee         = filter.fee;
    if (filter.hasHours)     params.hasHours    = filter.hasHours;
    if (filter.profile)      params.profile     = filter.profile;
    if (filter.lat)          params.lat         = filter.lat;
    if (filter.lng)          params.lng         = filter.lng;
    if (filter.maxDistance)  params.maxDistance = filter.maxDistance;
    const res = await api.get('/places', { params });
    return res.data;
  },

  getCategories: async (): Promise<string[]> => {
    const res = await api.get('/places/categories');
    return res.data;
  },

  getProfiles: async (): Promise<string[]> => {
    const res = await api.get('/places/profiles');
    return res.data;
  },
};