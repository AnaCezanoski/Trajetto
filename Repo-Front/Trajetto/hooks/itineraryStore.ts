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
  startDate: string;
  endDate: string;
  active: boolean;
  places: Places[];
}

type ItineraryStore = {
  itinerary: Itinerary | null;
  loading: boolean;
  error: string | null;
  fetchItinerary: (userId: number) => Promise<void>;
};

export const useItineraryStore = create<ItineraryStore>((set) => ({
  itinerary: null,
  loading: false,
  error: null,

  fetchItinerary: async (userId: number) => {
    try {
      set({ loading: true, error: null });

      const data = await ItineraryService.getItinerary(userId);

      set({
        itinerary: data,
        loading: false,
      });
    } catch (error) {
      set({
        error: 'Erro ao carregar itinerário',
        loading: false,
      });
    }
  },
}));