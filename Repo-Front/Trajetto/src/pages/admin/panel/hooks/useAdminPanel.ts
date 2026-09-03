import { useEffect, useState } from 'react';
import {
  statsService,
  Overview, CountryStats, ProfileStats, AgeGroupStats,
  ItineraryOverview, MonthStats, CategoryStats,
  TopRatedPlace, MostCommentedPlace, MostVisitedPlace,
} from '@/services';
import { getErrorMessage } from '@/utils/apiError';
import { useAuth } from '@/context/AuthContext';

export type AdminTab = 'usuarios' | 'roteiros';

export type AdminPanelData = {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  overview: Overview | null;
  countries: CountryStats[];
  profiles: ProfileStats[];
  ageGroups: AgeGroupStats[];
  itinOv: ItineraryOverview | null;
  perMonth: MonthStats[];
  categories: CategoryStats[];
  topRated: TopRatedPlace[];
  mostComment: MostCommentedPlace[];
  mostVisited: MostVisitedPlace[];
  loading: boolean;
  refreshing: boolean;
  error: string;
  verifiedPct: number;
  userFirstName: string | undefined;
  logout: () => Promise<void>;
  load: () => Promise<void>;
  onRefresh: () => void;
};

export function useAdminPanel(): AdminPanelData {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('usuarios');

  const [overview, setOverview] = useState<Overview | null>(null);
  const [countries, setCountries] = useState<CountryStats[]>([]);
  const [profiles, setProfiles] = useState<ProfileStats[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroupStats[]>([]);

  const [itinOv, setItinOv] = useState<ItineraryOverview | null>(null);
  const [perMonth, setPerMonth] = useState<MonthStats[]>([]);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [topRated, setTopRated] = useState<TopRatedPlace[]>([]);
  const [mostComment, setMostComment] = useState<MostCommentedPlace[]>([]);
  const [mostVisited, setMostVisited] = useState<MostVisitedPlace[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [ov, co, pr, ag, iov, pm, cat, tr, mc, mv] = await Promise.all([
        statsService.getOverview(),
        statsService.getCountries(),
        statsService.getTravelerProfiles(),
        statsService.getAgeGroups(),
        statsService.getItineraryOverview(),
        statsService.getItinerariesPerMonth(),
        statsService.getPlacesByCategory(),
        statsService.getTopRatedPlaces(),
        statsService.getMostCommentedPlaces(),
        statsService.getMostVisitedPlaces(),
      ]);
      setOverview(ov); setCountries(co); setProfiles(pr); setAgeGroups(ag);
      setItinOv(iov); setPerMonth(pm); setCategories(cat);
      setTopRated(tr); setMostComment(mc); setMostVisited(mv);
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
    activeTab,
    setActiveTab,
    overview,
    countries,
    profiles,
    ageGroups,
    itinOv,
    perMonth,
    categories,
    topRated,
    mostComment,
    mostVisited,
    loading,
    refreshing,
    error,
    verifiedPct,
    userFirstName: user?.firstName,
    logout,
    load,
    onRefresh,
  };
}
