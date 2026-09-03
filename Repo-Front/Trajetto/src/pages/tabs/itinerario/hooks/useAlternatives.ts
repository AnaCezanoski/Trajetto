import { useCallback, useState } from 'react';
import { Itinerary, Places, useItineraryStore } from '@/hooks/itineraryStore';
import { Place, placesService } from '@/services';
import { getErrorMessage } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';
import { useAuth } from '@/context/AuthContext';
import { selectAlternatives } from '@/src/domain/alternatives/selectAlternatives';

export function useAlternatives(itinerary: Itinerary | null) {
  const { user } = useAuth();
  const { replacePlace } = useItineraryStore();

  const [showAltModal, setShowAltModal] = useState(false);
  const [swipedPlace, setSwipedPlace] = useState<Places | null>(null);
  const [alternatives, setAlternatives] = useState<Place[]>([]);
  const [loadingAlts, setLoadingAlts] = useState(false);

  const handleSwipeLeft = useCallback(async (place: Places) => {
    setSwipedPlace(place);
    setShowAltModal(true);
    setLoadingAlts(true);
    setAlternatives([]);

    const tp = user?.travelerProfile;
    const profile = tp && tp !== 'SKIPPED' ? tp : undefined;
    const currentNames = new Set(itinerary?.places.map((p) => p.name) ?? []);

    try {
      const allByProfile = await placesService.getAll({ profile });
      setAlternatives(selectAlternatives(allByProfile, place, currentNames));
    } catch {
      setAlternatives([]);
    } finally {
      setLoadingAlts(false);
    }
  }, [itinerary, user]);

  const handleSelectAlternative = useCallback(async (alt: Place) => {
    if (!swipedPlace) return;
    const newPlace: Places = {
      name: alt.name,
      address: alt.address,
      latitude: alt.latitude,
      longitude: alt.longitude,
      estimatedVisitTime: swipedPlace.estimatedVisitTime,
      orderIndex: swipedPlace.orderIndex,
      openingHours: alt.openingHours ?? null,
      category: alt.category ?? null,
      fee: alt.fee ?? null,
    };
    setShowAltModal(false);
    setSwipedPlace(null);
    setAlternatives([]);
    try {
      await replacePlace(swipedPlace.orderIndex, newPlace);
    } catch (e) {
      showAlert(getErrorMessage(e, 'Não foi possível salvar a alteração.'), { title: 'Erro' });
    }
  }, [swipedPlace, replacePlace]);

  const handleCancelAlt = useCallback(() => {
    setShowAltModal(false);
    setSwipedPlace(null);
    setAlternatives([]);
  }, []);

  return {
    showAltModal,
    swipedPlace,
    alternatives,
    loadingAlts,
    handleSwipeLeft,
    handleSelectAlternative,
    handleCancelAlt,
  };
}
