import { create } from 'zustand';
import { ItineraryService } from '../services/itineraryService';

export interface Places {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  estimatedVisitTime: string;
  orderIndex: number;
  openingHours?: string | null;
  category?: string | null;
  fee?: string | null;
}

export interface Itinerary {
  id: number;
  startDate: string;
  endDate: string;
  active: boolean;
  places: Places[];
  originLatitude?: number | null;
  originLongitude?: number | null;
  rating?: number | null;
  ratingDescription?: string | null;
}

type ItineraryStore = {
  itinerary: Itinerary | null;
  itineraries: Itinerary[];
  loading: boolean;
  error: string | null;
  highlightedPlaceIndex: number | null;
  focusedMapPlaceIndex: number | null;
  fetchItinerary: (userId: number) => Promise<void>;
  fetchAllItineraries: (userId: number) => Promise<void>;
  generateItinerary: (userId: number, startLat: number, startLng: number) => Promise<Itinerary>;
  acceptGeneratedItinerary: (itinerary: Itinerary) => void;
  activateItinerary: (itineraryId: number, userId: number) => Promise<void>;
  deleteItinerary: (itineraryId: number, userId: number) => Promise<void>;
  rateItinerary: (itineraryId: number, rating: number | null, ratingDescription: string | null) => Promise<void>;
  setHighlightedPlace: (index: number | null) => void;
  setFocusedMapPlace: (index: number | null) => void;
};

export const useItineraryStore = create<ItineraryStore>((set, get) => ({
  itinerary: null,
  itineraries: [],
  loading: false,
  error: null,
  highlightedPlaceIndex: null,
  focusedMapPlaceIndex: null,

  fetchItinerary: async (userId: number) => {
    try {
      set({ loading: true, error: null });
      const data = await ItineraryService.getItinerary(userId);
      set({ itinerary: data ?? null, loading: false });
    } catch {
      set({ itinerary: null, error: null, loading: false });
    }
  },

  fetchAllItineraries: async (userId: number) => {
    try {
      set({ loading: true, error: null });
      const data: Itinerary[] = await ItineraryService.getAllItineraries(userId);
      const active = data.find(i => i.active) ?? null;
      set({ itineraries: data, itinerary: active, loading: false });
    } catch {
      set({ itineraries: [], itinerary: null, error: null, loading: false });
    }
  },

  generateItinerary: async (userId: number, startLat: number, startLng: number) => {
    const data = await ItineraryService.generateItinerary(userId, startLat, startLng);
    return data as Itinerary;
  },

  acceptGeneratedItinerary: (itinerary: Itinerary) => {
    const prev = get().itineraries.map(i => ({ ...i, active: false }));
    set({ itinerary, itineraries: [itinerary, ...prev] });
  },

  activateItinerary: async (itineraryId: number, userId: number) => {
    const activated = await ItineraryService.activateItinerary(itineraryId, userId);
    set(state => ({
      itinerary: activated,
      itineraries: state.itineraries.map(i => ({ ...i, active: i.id === itineraryId })),
    }));
  },

  deleteItinerary: async (itineraryId: number, userId: number) => {
    await ItineraryService.deleteItinerary(itineraryId, userId);
    set(state => {
      const remaining = state.itineraries.filter(i => i.id !== itineraryId);
      const activeStillExists = remaining.find(i => i.active) ?? null;
      return {
        itineraries: remaining,
        itinerary: state.itinerary?.id === itineraryId ? activeStillExists : state.itinerary,
      };
    });
  },

  rateItinerary: async (itineraryId, rating, ratingDescription) => {
    const updated = await ItineraryService.rateItinerary(itineraryId, rating, ratingDescription);
    set(state => ({
      itinerary: state.itinerary?.id === itineraryId ? updated : state.itinerary,
      itineraries: state.itineraries.map(i => i.id === itineraryId ? updated : i),
    }));
  },

  setHighlightedPlace: (index) => set({ highlightedPlaceIndex: index }),
  setFocusedMapPlace: (index) => set({ focusedMapPlaceIndex: index }),
}));
