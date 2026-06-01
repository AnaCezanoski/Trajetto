import { api } from './api';

export interface Overview {
  totalUsers: number;
  totalAdmins: number;
  totalClients: number;
  totalItineraries: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  avgAge: number | null;
}

export interface CountryStats   { country: string; count: number; }
export interface ProfileStats   { profile: string; count: number; }
export interface ItineraryStats { user: string; email: string; count: number; }
export interface AgeGroupStats  { group: string; count: number; }

export const statsService = {
  getOverview:           () => api.get<Overview>('/stats/overview').then(r => r.data),
  getCountries:          () => api.get<CountryStats[]>('/stats/countries').then(r => r.data),
  getTravelerProfiles:   () => api.get<ProfileStats[]>('/stats/traveler-profiles').then(r => r.data),
  getItinerariesPerUser: () => api.get<ItineraryStats[]>('/stats/itineraries-per-user').then(r => r.data),
  getAgeGroups:          () => api.get<AgeGroupStats[]>('/stats/age-groups').then(r => r.data),
};