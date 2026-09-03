import { useState } from 'react';
import { useMapaLocation } from './useMapaLocation';
import { useMapaSearch } from './useMapaSearch';
import { useMapaFilters } from './useMapaFilters';
import { haversineMeters } from '../mapaFormat';

export function useMapa() {
  const location = useMapaLocation();
  const search = useMapaSearch(location.mapRef, location.userLocation);
  const filters = useMapaFilters(search.search, search.doSearch);

  // Ao contrario do carousel de Roteiros/Itinerario, este destIndex nao roda
  // sozinho (sem setInterval) — mesmo comportamento do mapa.tsx original.
  const [destIndex] = useState(0);

  const spotDistance = search.selectedSpot && location.userLocation
    ? haversineMeters(
        location.userLocation.latitude,
        location.userLocation.longitude,
        search.selectedSpot.latitude,
        search.selectedSpot.longitude,
      )
    : null;

  return {
    ...location,
    ...search,
    ...filters,
    destIndex,
    spotDistance,
    handleSearchChange: (text: string) => search.handleSearchChange(text, filters.activeFilter),
  };
}
