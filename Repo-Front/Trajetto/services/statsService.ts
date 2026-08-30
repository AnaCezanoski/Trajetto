import { api } from './api';

// ─── Interfaces de usuários ────────────────────────────────────────────────
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
export interface AgeGroupStats  { group: string; count: number; }

/** Uma linha do ranking de clientes que mais criaram roteiros. */
export interface ClientItineraryCount { user: string; email: string; count: number; }

/**
 * Bloco "roteiros por cliente". O endpoint devolvia a lista de todos os
 * clientes e a tela cortava as dez primeiras e contava quantas vinham com
 * zero; agora o ranking chega recortado e as duas contagens chegam prontas.
 */
export interface ItinerariesPerUserPanel {
  topClients: ClientItineraryCount[];
  clientsWithItinerary: number;
  clientsWithoutItinerary: number;
}

// ─── Interfaces de roteiros ────────────────────────────────────────────────
export interface ItineraryOverview {
  totalItineraries: number;
  avgDurationDays: number | null;
  avgRating: number | null;
  ratedCount: number;
  unratedCount: number;
}

export interface MonthStats        { month: string; count: number; }
export interface CategoryStats     { category: string; count: number; }
export interface TopRatedPlace     { name: string; xid: string; avgRating: number; totalRatings: number; }
export interface MostCommentedPlace{ name: string; xid: string; commentCount: number; }
export interface MostVisitedPlace  { name: string; count: number; }

// ─── Service ───────────────────────────────────────────────────────────────
export const statsService = {
  // Usuários
  getOverview:           () => api.get<Overview>('/stats/overview').then(r => r.data),
  getCountries:          () => api.get<CountryStats[]>('/stats/countries').then(r => r.data),
  getTravelerProfiles:   () => api.get<ProfileStats[]>('/stats/traveler-profiles').then(r => r.data),
  getItinerariesPerUser: () => api.get<ItinerariesPerUserPanel>('/stats/itineraries-per-user').then(r => r.data),
  getAgeGroups:          () => api.get<AgeGroupStats[]>('/stats/age-groups').then(r => r.data),

  // Roteiros
  getItineraryOverview:    () => api.get<ItineraryOverview>('/stats/itinerary-overview').then(r => r.data),
  getItinerariesPerMonth:  () => api.get<MonthStats[]>('/stats/itineraries-per-month').then(r => r.data),
  getPlacesByCategory:     () => api.get<CategoryStats[]>('/stats/places-by-category').then(r => r.data),
  getTopRatedPlaces:       () => api.get<TopRatedPlace[]>('/stats/top-rated-places').then(r => r.data),
  getMostCommentedPlaces:  () => api.get<MostCommentedPlace[]>('/stats/most-commented-places').then(r => r.data),
  getMostVisitedPlaces:    () => api.get<MostVisitedPlace[]>('/stats/most-visited-places').then(r => r.data),
};
