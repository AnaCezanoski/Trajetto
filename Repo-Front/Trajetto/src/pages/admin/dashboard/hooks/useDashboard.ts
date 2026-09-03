import { useEffect, useState } from 'react';
import {
  statsService, Overview, CountryStats, ProfileStats, AgeGroupStats,
  ItinerariesPerUserPanel, ItineraryOverview, MonthStats, CategoryStats,
  TopRatedPlace, MostCommentedPlace, MostVisitedPlace,
} from '@/services';
import { getErrorMessage } from '@/utils/apiError';

export type DashboardData = {
  overview: Overview | null;
  countries: CountryStats[];
  profiles: ProfileStats[];
  ageGroups: AgeGroupStats[];
  perClient: ItinerariesPerUserPanel | null;
  itinerary: ItineraryOverview | null;
  perMonth: MonthStats[];
  categories: CategoryStats[];
  visited: MostVisitedPlace[];
  topRated: TopRatedPlace[];
  commented: MostCommentedPlace[];
  loading: boolean;
  refreshing: boolean;
  error: string;
  verifiedPct: number;
  load: () => Promise<void>;
  onRefresh: () => void;
};

export function useDashboard(): DashboardData {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [countries, setCountries] = useState<CountryStats[]>([]);
  const [profiles, setProfiles] = useState<ProfileStats[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroupStats[]>([]);
  const [perClient, setPerClient] = useState<ItinerariesPerUserPanel | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryOverview | null>(null);
  const [perMonth, setPerMonth] = useState<MonthStats[]>([]);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [visited, setVisited] = useState<MostVisitedPlace[]>([]);
  const [topRated, setTopRated] = useState<TopRatedPlace[]>([]);
  const [commented, setCommented] = useState<MostCommentedPlace[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [ov, co, pr, ag, cli, itin, mes, cat, vis, top, com] = await Promise.all([
        statsService.getOverview(),
        statsService.getCountries(),
        statsService.getTravelerProfiles(),
        statsService.getAgeGroups(),
        statsService.getItinerariesPerUser(),
        statsService.getItineraryOverview(),
        statsService.getItinerariesPerMonth(),
        statsService.getPlacesByCategory(),
        statsService.getMostVisitedPlaces(),
        statsService.getTopRatedPlaces(),
        statsService.getMostCommentedPlaces(),
      ]);
      setOverview(ov);
      setCountries(co);
      setProfiles(pr);
      setAgeGroups(ag);
      setPerClient(cli);
      setItinerary(itin);
      setPerMonth(mes);
      setCategories(cat);
      setVisited(vis);
      setTopRated(top);
      setCommented(com);
      setError('');
    } catch (e) {
      setError(getErrorMessage(e, 'Não foi possível carregar os dados.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const verifiedPct = overview && overview.totalUsers > 0
    ? Math.round((overview.verifiedUsers / overview.totalUsers) * 100) : 0;

  return {
    overview, countries, profiles, ageGroups,
    perClient, itinerary, perMonth,
    categories, visited, topRated, commented,
    loading, refreshing, error, verifiedPct,
    load, onRefresh,
  };
}
