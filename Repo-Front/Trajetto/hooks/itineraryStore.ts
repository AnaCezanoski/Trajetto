import { create } from 'zustand';
import { ItineraryService } from '../services/itineraryService';

export interface Places {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  estimatedVisitTime: string;
  orderIndex: number;
}

export interface Itinerary {
  id: number;
  startDate: string;
  endDate: string;
  active: boolean;
  places: Places[];
  originLatitude?: number | null;
  originLongitude?: number | null;
}

type ItineraryStore = {
  itinerary: Itinerary | null;
  loading: boolean;
  error: string | null;
  highlightedPlaceIndex: number | null;
  focusedMapPlaceIndex: number | null;
  fetchItinerary: (userId: number) => Promise<void>;
  generateItinerary: (userId: number, startLat: number, startLng: number) => Promise<Itinerary>;
  acceptGeneratedItinerary: (itinerary: Itinerary) => void;
  deleteItinerary: (itineraryId: number, userId: number) => Promise<void>;
  setHighlightedPlace: (index: number | null) => void;
  setFocusedMapPlace: (index: number | null) => void;
};

export const useItineraryStore = create<ItineraryStore>((set) => ({
  itinerary: null,
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

  generateItinerary: async (userId: number, startLat: number, startLng: number) => {
    const data = await ItineraryService.generateItinerary(userId, startLat, startLng);
    return data as Itinerary;
  },

  acceptGeneratedItinerary: (itinerary: Itinerary) => {
    set({ itinerary });
  },

  deleteItinerary: async (itineraryId: number, userId: number) => {
    await ItineraryService.deleteItinerary(itineraryId, userId);
    set({ itinerary: null });
  },

  setHighlightedPlace: (index) => set({ highlightedPlaceIndex: index }),
  setFocusedMapPlace: (index) => set({ focusedMapPlaceIndex: index }),
}));
