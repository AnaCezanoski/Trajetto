// Porta de entrada da camada de serviços.
//
// Telas, componentes e contextos importam daqui ('../services') e não conhecem
// endereços, verbos HTTP nem o formato das respostas do backend. Trocar o backend de
// lugar, mudar um endereço ou até o cliente HTTP é mexer só dentro desta pasta.
//
// O cliente HTTP (services/api.ts) fica de fora de propósito: é detalhe interno da camada.

export { authService } from './authService';
export type { LoginResponse, ResetPasswordRequest } from './authService';

export { userService } from './userService';
export type { ProfileRequest } from './userService';

export { placesService } from './placesService';
export type { Place, PlacesFilter } from './placesService';

export { ItineraryService } from './itineraryService';

export { RatingService } from './ratingService';
export type { CreateRatingRequest, Rating, RatingSummary } from './ratingService';

export { RouteService } from './routeService';

export { statsService } from './statsService';
export type {
  AgeGroupStats, CategoryStats, CountryStats, ItineraryOverview, ItineraryStats,
  MonthStats, MostCommentedPlace, MostVisitedPlace, Overview, ProfileStats,
  TopRatedPlace,
} from './statsService';

export { geocodingService, searchAddresses } from './geocodingService';
export type { PlaceSuggestion } from './geocodingService';

export { searchByCity, touristSpotService } from './touristSpotService';
export type { SearchOptions, TouristSpot } from './touristSpotService';
