import { useEffect, useState } from 'react';
import { placesService, PlacesFilter } from '@/services';
import { countActiveFilters } from '../mapaFormat';

type DoSearch = (text: string, filter: PlacesFilter) => Promise<void>;

export function useMapaFilters(search: string, doSearch: DoSearch) {
  const [showFilter, setShowFilter] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<PlacesFilter>({});

  const [tempCategory, setTempCategory] = useState('');
  const [tempFee, setTempFee] = useState<'yes' | 'no' | ''>('');
  const [tempHasHours, setTempHasHours] = useState(false);
  const [tempProfile, setTempProfile] = useState('');
  const [tempMaxDistance, setTempMaxDistance] = useState<number | undefined>(undefined);

  const activeCount = countActiveFilters(activeFilter);

  useEffect(() => {
    placesService.getCategories().then(setCategories).catch(() => {});
    placesService.getProfiles().then(setProfiles).catch(() => {});
  }, []);

  const openFilter = () => {
    setTempCategory(activeFilter.category || '');
    setTempFee((activeFilter.fee as 'yes' | 'no' | '') || '');
    setTempHasHours(activeFilter.hasHours || false);
    setTempProfile(activeFilter.profile || '');
    setTempMaxDistance(activeFilter.maxDistance);
    setShowFilter(true);
  };

  const handleApplyFilter = () => {
    const newFilter: PlacesFilter = {
      category: tempCategory || undefined,
      fee: tempFee || undefined,
      hasHours: tempHasHours || undefined,
      profile: tempProfile || undefined,
      maxDistance: tempMaxDistance,
    };
    setActiveFilter(newFilter);
    setShowFilter(false);
    if (search.trim()) doSearch(search, newFilter);
  };

  const handleClearAllFilters = () => {
    setTempCategory('');
    setTempFee('');
    setTempHasHours(false);
    setTempProfile('');
    setTempMaxDistance(undefined);
    setActiveFilter({});
    setShowFilter(false);
    if (search.trim()) doSearch(search, {});
  };

  const removeFilter = (patch: Partial<PlacesFilter>) => {
    const f = { ...activeFilter, ...patch };
    setActiveFilter(f);
    if (search.trim()) doSearch(search, f);
  };

  return {
    showFilter,
    setShowFilter,
    categories,
    profiles,
    activeFilter,
    activeCount,
    tempCategory,
    setTempCategory,
    tempFee,
    setTempFee,
    tempHasHours,
    setTempHasHours,
    tempProfile,
    setTempProfile,
    tempMaxDistance,
    setTempMaxDistance,
    openFilter,
    handleApplyFilter,
    handleClearAllFilters,
    removeFilter,
  };
}
