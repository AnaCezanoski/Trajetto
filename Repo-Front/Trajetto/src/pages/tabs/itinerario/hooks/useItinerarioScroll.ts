import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Itinerary, useItineraryStore } from '@/hooks/itineraryStore';
import { isPlacePast } from '@/app/utils/isPlacePast';

export function useItinerarioScroll(itinerary: Itinerary | null) {
  const { highlightedPlaceIndex, setHighlightedPlace } = useItineraryStore();
  const [layoutReady, setLayoutReady] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const cardOffsets = useRef<number[]>([]);

  const registerCardOffset = (idx: number, y: number, total: number) => {
    cardOffsets.current[idx] = y;
    if (cardOffsets.current.length === total) setLayoutReady(true);
  };

  // Rola ate o card destacado ao voltar do mapa
  useEffect(() => {
    if (highlightedPlaceIndex === null) return;
    const offset = cardOffsets.current[highlightedPlaceIndex];
    if (offset !== undefined) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, offset - 20), animated: true });
      }, 100);
    }
    const timer = setTimeout(() => setHighlightedPlace(null), 800);
    return () => clearTimeout(timer);
  }, [highlightedPlaceIndex]);

  useFocusEffect(
    useCallback(() => {
      if (!layoutReady) return;
      if (!itinerary?.places?.length) return;

      const sorted = [...itinerary.places].sort((a, b) => a.orderIndex - b.orderIndex);
      const firstUpcomingIndex = sorted.findIndex(
        (place) => !isPlacePast(itinerary.startDate, place.estimatedVisitTime)
      );
      if (firstUpcomingIndex === -1) return;

      requestAnimationFrame(() => {
        const offset = cardOffsets.current[firstUpcomingIndex];
        if (offset == null) return;
        scrollRef.current?.scrollTo({ y: Math.max(0, offset - 100), animated: true });
      });
    }, [layoutReady, itinerary])
  );

  return { scrollRef, highlightedPlaceIndex, registerCardOffset };
}
