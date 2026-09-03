import { useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import MapView from 'react-native-maps';
import { Place, placesService, PlacesFilter } from '@/services';
import { LatLng } from '../mapaFormat';

const SEARCH_DEBOUNCE_MS = 350;

export function useMapaSearch(mapRef: React.RefObject<MapView | null>, userLocation: LatLng | null) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Place | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = async (text: string, filter: PlacesFilter) => {
    if (!text.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    setSearchLoading(true);
    try {
      const results = await placesService.getAll({
        search: text,
        ...filter,
        lat: filter.maxDistance ? userLocation?.latitude : undefined,
        lng: filter.maxDistance ? userLocation?.longitude : undefined,
      });
      setSuggestions(results.slice(0, 8));
      setShowSuggestions(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (text: string, activeFilter: PlacesFilter) => {
    setSearch(text);
    setSelectedSpot(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(text, activeFilter), SEARCH_DEBOUNCE_MS);
  };

  const handleSelectSuggestion = (spot: Place) => {
    Keyboard.dismiss();
    setSearch(spot.name);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSpot(spot);
    mapRef.current?.animateToRegion({
      latitude: spot.latitude,
      longitude: spot.longitude,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    }, 600);
  };

  const handleClearSearch = () => {
    setSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSpot(null);
  };

  const hideSuggestions = () => setShowSuggestions(false);

  return {
    search,
    suggestions,
    showSuggestions,
    searchLoading,
    selectedSpot,
    setSelectedSpot,
    doSearch,
    handleSearchChange,
    handleSelectSuggestion,
    handleClearSearch,
    hideSuggestions,
  };
}
