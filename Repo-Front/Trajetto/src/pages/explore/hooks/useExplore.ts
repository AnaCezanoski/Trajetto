import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Place, placesService } from '@/services';

export type ExploreData = {
  spots: Place[];
  categories: string[];
  loading: boolean;
  search: string;
  selectedCategory: string;
  showFilter: boolean;
  tempCategory: string;
  searched: boolean;
  activeFilters: number;
  setTempCategory: (v: string) => void;
  openFilter: () => void;
  closeFilter: () => void;
  handleSearchChange: (text: string) => void;
  handleApplyFilter: () => void;
  handleClearFilter: () => void;
  handleSpotPress: (spot: Place) => void;
};

export function useExplore(): ExploreData {
  const router = useRouter();

  const [spots, setSpots] = useState<Place[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [tempCategory, setTempCategory] = useState('');
  const [searched, setSearched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSpots = useCallback(async (searchTerm: string, category: string) => {
    setLoading(true);
    try {
      const results = await placesService.getAll({
        search: searchTerm || undefined,
        category: category || undefined,
      });
      setSpots(results);
      setSearched(true);
    } catch {
      setSpots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    placesService.getCategories().then(setCategories).catch(() => {});
    fetchSpots('', '');
  }, [fetchSpots]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSpots(text, selectedCategory);
    }, 400);
  };

  const handleApplyFilter = () => {
    setSelectedCategory(tempCategory);
    setShowFilter(false);
    fetchSpots(search, tempCategory);
  };

  const handleClearFilter = () => {
    setTempCategory('');
    setSelectedCategory('');
    setShowFilter(false);
    fetchSpots(search, '');
  };

  const handleSpotPress = (spot: Place) => {
    router.push({ pathname: '/SpotDetailScreen', params: { spot: JSON.stringify(spot) } });
  };

  return {
    spots,
    categories,
    loading,
    search,
    selectedCategory,
    showFilter,
    tempCategory,
    searched,
    activeFilters: [selectedCategory].filter(Boolean).length,
    setTempCategory,
    openFilter: () => {
      setTempCategory(selectedCategory);
      setShowFilter(true);
    },
    closeFilter: () => setShowFilter(false),
    handleSearchChange,
    handleApplyFilter,
    handleClearFilter,
    handleSpotPress,
  };
}
