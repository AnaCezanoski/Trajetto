import { useRouter } from 'expo-router';
import { useItineraryStore } from '@/hooks/itineraryStore';
import { useDestinationCarousel } from '@/src/pages/tabs/shared/hooks/useDestinationCarousel';
import { useAlternatives } from './useAlternatives';
import { usePlaceRating } from './usePlaceRating';
import { useExportPdf } from './useExportPdf';
import { useItinerarioScroll } from './useItinerarioScroll';

export function useItinerario() {
  const router = useRouter();
  const destIndex = useDestinationCarousel();
  const { itinerary, loading, setFocusedMapPlace } = useItineraryStore();

  const alternatives = useAlternatives(itinerary);
  const rating = usePlaceRating();
  const { handleExportPDF } = useExportPdf();
  const { scrollRef, highlightedPlaceIndex, registerCardOffset } = useItinerarioScroll(itinerary);

  return {
    router,
    destIndex,
    itinerary,
    loading,
    setFocusedMapPlace,
    scrollRef,
    highlightedPlaceIndex,
    registerCardOffset,
    ...alternatives,
    rating,
    handleExportPDF: () => handleExportPDF(itinerary),
  };
}
