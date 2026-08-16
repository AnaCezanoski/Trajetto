import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import {
  statsService,
  Overview, CountryStats, ProfileStats, AgeGroupStats,
  ItineraryOverview, MonthStats, CategoryStats,
  TopRatedPlace, MostCommentedPlace, MostVisitedPlace,
} from '../services/statsService';
import { getErrorMessage } from '../utils/apiError';

const PRIMARY = '#023665';
const COLORS  = ['#023665','#2563EB','#7C3AED','#DB2777','#D97706','#16A34A','#0891B2','#DC2626'];

// ─── Helpers visuais ─────────────────────────────────────────────────────────

function BarChart({ data, labelKey, valueKey }: { data: any[]; labelKey: string; valueKey: string }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <View style={styles.barChart}>
      {data.slice(0, 8).map((item, i) => (
        <View key={i} style={styles.barRow}>
          <Text style={styles.barLabel} numberOfLines={1}>{item[labelKey]}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${(item[valueKey] / max) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }]} />
          </View>
          <Text style={styles.barValue}>{item[valueKey]}</Text>
        </View>
      ))}
    </View>
  );
}

function DonutLegend({ data, labelKey, valueKey }: { data: any[]; labelKey: string; valueKey: string }) {
  const total = data.reduce((acc, d) => acc + d[valueKey], 0);
  return (
    <View style={styles.donutLegend}>
      {data.map((item, i) => {
        const pct = total > 0 ? Math.round((item[valueKey] / total) * 100) : 0;
        return (
          <View key={i} style={styles.donutRow}>
            <View style={[styles.donutDot, { backgroundColor: COLORS[i % COLORS.length] }]} />
            <Text style={styles.donutLabel} numberOfLines={1}>{item[labelKey]}</Text>
            <View style={styles.donutBarTrack}>
              <View style={[styles.donutBarFill, { width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }]} />
            </View>
            <Text style={styles.donutPct}>{pct}%</Text>
          </View>
        );
      })}
    </View>
  );
}

function StatCard({ icon, label, value, color, sub }: {
  icon: string; label: string; value: string | number; color?: string; sub?: string;
}) {
  return (
    <View style={[styles.statCard, color ? { borderLeftColor: color, borderLeftWidth: 4 } : null]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function StarRating({ value }: { value: number }) {
  const full  = Math.floor(value);
  const half  = value - full >= 0.3 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <Text style={styles.stars}>
      {'★'.repeat(full)}{'½'.repeat(half)}{'☆'.repeat(empty)}
    </Text>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function AdminPanelScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'usuarios' | 'roteiros'>('usuarios');

  // Estado — aba Usuários
  const [overview,   setOverview]   = useState<Overview | null>(null);
  const [countries,  setCountries]  = useState<CountryStats[]>([]);
  const [profiles,   setProfiles]   = useState<ProfileStats[]>([]);
  const [ageGroups,  setAgeGroups]  = useState<AgeGroupStats[]>([]);

  // Estado — aba Roteiros
  const [itinOv,     setItinOv]     = useState<ItineraryOverview | null>(null);
  const [perMonth,   setPerMonth]   = useState<MonthStats[]>([]);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [topRated,   setTopRated]   = useState<TopRatedPlace[]>([]);
  const [mostComment,setMostComment]= useState<MostCommentedPlace[]>([]);
  const [mostVisited,setMostVisited]= useState<MostVisitedPlace[]>([]);

  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');

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
      setOverview(ov);   setCountries(co);  setProfiles(pr);   setAgeGroups(ag);
      setItinOv(iov);    setPerMonth(pm);   setCategories(cat);
      setTopRated(tr);   setMostComment(mc);setMostVisited(mv);
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

  return (
    <SafeAreaView style={styles.safe}>

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Painel Admin</Text>
          <Text style={styles.headerSub}>Olá, {user?.firstName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Quick actions ─── */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/UserListScreen')} activeOpacity={0.85}>
          <Text style={styles.quickLabel}>Usuários</Text>
          <Text style={styles.quickCount}>{overview?.totalUsers ?? '—'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#7C3AED' }]} activeOpacity={0.85}>
          <Text style={styles.quickLabel}>Roteiros</Text>
          <Text style={styles.quickCount}>{overview?.totalItineraries ?? '—'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#16A34A' }]} activeOpacity={0.85}>
          <Text style={styles.quickLabel}>Verificados</Text>
          <Text style={styles.quickCount}>{overview ? `${verifiedPct}%` : '—'}</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Tab bar ─── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'usuarios' && styles.tabBtnActive]}
          onPress={() => setActiveTab('usuarios')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'usuarios' && styles.tabTextActive]}>👥 Usuários</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'roteiros' && styles.tabBtnActive]}
          onPress={() => setActiveTab('roteiros')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'roteiros' && styles.tabTextActive]}>🗺️ Roteiros</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Conteúdo ─── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : activeTab === 'usuarios' ? (
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />}
        >
          {/* Stat cards */}
          <View style={styles.statsGrid}>
            <StatCard icon="👥" label="Total usuários"  value={overview?.totalUsers ?? 0}       color={PRIMARY} />
            <StatCard icon="🛡️" label="Admins"          value={overview?.totalAdmins ?? 0}      color="#7C3AED" />
            <StatCard icon="🗺️" label="Roteiros"        value={overview?.totalItineraries ?? 0} color="#D97706" />
            <StatCard icon="✅" label="Verificados"     value={overview?.verifiedUsers ?? 0}    color="#16A34A" sub={`${verifiedPct}% do total`} />
            <StatCard icon="⏳" label="Não verificados" value={overview?.unverifiedUsers ?? 0}  color="#DC2626" />
            {overview?.avgAge && (
              <StatCard icon="🎂" label="Idade média"   value={`${overview.avgAge} anos`}       color="#0891B2" />
            )}
          </View>

          <Section title="Taxa de verificação de e-mail">
            <View style={styles.verifiedRow}>
              <View style={styles.verifiedBarTrack}>
                <View style={[styles.verifiedBarFill, { width: `${verifiedPct}%` }]} />
              </View>
              <Text style={styles.verifiedPct}>{verifiedPct}%</Text>
            </View>
            <View style={styles.verifiedLegend}>
              <Text style={styles.verifiedLegendText}>✅ {overview?.verifiedUsers} verificados</Text>
              <Text style={styles.verifiedLegendText}>⏳ {overview?.unverifiedUsers} pendentes</Text>
            </View>
          </Section>

          {profiles.length > 0 && (
            <Section title="Perfis de viajante">
              <DonutLegend data={profiles} labelKey="profile" valueKey="count" />
            </Section>
          )}

          {ageGroups.filter(g => g.count > 0).length > 0 && (
            <Section title="Faixas etárias">
              <BarChart data={ageGroups.filter(g => g.count > 0)} labelKey="group" valueKey="count" />
            </Section>
          )}

          {countries.length > 0 && (
            <Section title={`Países (${countries.length})`}>
              <BarChart data={countries} labelKey="country" valueKey="count" />
            </Section>
          )}

          <TouchableOpacity
            style={styles.userListBtn}
            onPress={() => router.push('/UserListScreen')}
            activeOpacity={0.85}
          >
            <Text style={styles.userListBtnIcon}>👥</Text>
            <Text style={styles.userListBtnText}>Ver lista completa de usuários</Text>
            <Text style={styles.userListBtnArrow}>›</Text>
          </TouchableOpacity>
        </ScrollView>

      ) : (
        /* ─── Aba Roteiros ─── */
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />}
        >
          {/* Overview roteiros */}
          <View style={styles.statsGrid}>
            <StatCard icon="🗺️" label="Total roteiros"   value={itinOv?.totalItineraries ?? 0}                        color={PRIMARY} />
            <StatCard icon="📅" label="Duração média"    value={itinOv?.avgDurationDays != null ? `${itinOv.avgDurationDays} dias` : '—'} color="#2563EB" />
            <StatCard icon="⭐" label="Nota média"       value={itinOv?.avgRating != null ? `${itinOv.avgRating}/5` : '—'}              color="#D97706" />
            <StatCard icon="✅" label="Com avaliação"    value={itinOv?.ratedCount ?? 0}   color="#16A34A" sub={`${itinOv?.unratedCount ?? 0} sem nota`} />
          </View>

          {/* Roteiros por mês */}
          {perMonth.length > 0 && (
            <Section title="Roteiros gerados por mês">
              <BarChart data={perMonth} labelKey="month" valueKey="count" />
            </Section>
          )}

          {/* Categorias de locais */}
          {categories.length > 0 && (
            <Section title="Locais por categoria">
              <DonutLegend data={categories} labelKey="category" valueKey="count" />
            </Section>
          )}

          {/* Locais mais bem avaliados */}
          {topRated.length > 0 && (
            <Section title="Locais mais bem avaliados">
              <View>
                {topRated.slice(0, 8).map((item, i) => (
                  <View key={i} style={[styles.rankRow, i < topRated.length - 1 && styles.rankRowBorder]}>
                    <View style={[styles.rankBadge, { backgroundColor: COLORS[i % COLORS.length] }]}>
                      <Text style={styles.rankBadgeText}>{i + 1}</Text>
                    </View>
                    <View style={styles.rankInfo}>
                      <Text style={styles.rankName} numberOfLines={1}>{item.name}</Text>
                      <StarRating value={item.avgRating} />
                    </View>
                    <View style={styles.rankCountBox}>
                      <Text style={styles.rankCount}>{item.avgRating}</Text>
                      <Text style={styles.rankCountLabel}>{item.totalRatings} aval.</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* Locais mais comentados */}
          {mostComment.length > 0 && (
            <Section title="Locais com mais comentários">
              <View>
                {mostComment.slice(0, 8).map((item, i) => (
                  <View key={i} style={[styles.rankRow, i < mostComment.length - 1 && styles.rankRowBorder]}>
                    <View style={[styles.rankBadge, { backgroundColor: COLORS[i % COLORS.length] }]}>
                      <Text style={styles.rankBadgeText}>{i + 1}</Text>
                    </View>
                    <View style={styles.rankInfo}>
                      <Text style={styles.rankName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.rankEmail}>💬 {item.commentCount} {item.commentCount === 1 ? 'comentário' : 'comentários'}</Text>
                    </View>
                    <View style={styles.rankCountBox}>
                      <Text style={styles.rankCount}>{item.commentCount}</Text>
                      <Text style={styles.rankCountLabel}>coment.</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* Locais mais visitados */}
          {mostVisited.length > 0 && (
            <Section title="Locais mais incluídos em roteiros">
              <BarChart data={mostVisited} labelKey="name" valueKey="count" />
            </Section>
          )}

          {topRated.length === 0 && mostComment.length === 0 && mostVisited.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>Nenhum dado de locais disponível ainda.</Text>
              <Text style={styles.emptySubText}>Os dados aparecerão conforme os usuários gerarem roteiros e avaliarem locais.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6F9' },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: PRIMARY, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  logoutBtn:   { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  logoutText:  { color: '#fff', fontWeight: '600', fontSize: 14 },

  // Quick actions
  quickActions: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 16,
    paddingVertical: 16, backgroundColor: PRIMARY,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  quickCard: {
    flex: 1, backgroundColor: '#2563EB', borderRadius: 16,
    padding: 14, alignItems: 'center', gap: 4,
  },
  quickLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  quickCount: { fontSize: 20, fontWeight: '800', color: '#fff' },

  // Tab bar
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    marginHorizontal: 16, marginTop: 16, borderRadius: 14,
    padding: 4, gap: 4,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  tabBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  tabBtnActive: { backgroundColor: PRIMARY },
  tabText:       { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#fff' },

  // Content
  container:   { padding: 16, paddingBottom: 40 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  loadingText: { fontSize: 14, color: '#6B7280' },
  errorIcon:   { fontSize: 48 },
  errorText:   { fontSize: 15, color: '#374151', textAlign: 'center' },
  retryBtn:    { backgroundColor: PRIMARY, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  retryText:   { color: '#fff', fontWeight: '700' },

  // Stat cards
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8, marginTop: 16 },
  statCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, width: '47%',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  statIcon:  { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  statSub:   { fontSize: 11, color: '#9CA3AF', marginTop: 4 },

  // Section
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 8, marginLeft: 2,
  },
  sectionCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },

  // Bar chart
  barChart: { gap: 10 },
  barRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { fontSize: 12, color: '#374151', width: 72 },
  barTrack: { flex: 1, height: 10, backgroundColor: '#F3F4F6', borderRadius: 5, overflow: 'hidden' },
  barFill:  { height: 10, borderRadius: 5 },
  barValue: { fontSize: 12, fontWeight: '700', color: '#111827', width: 24, textAlign: 'right' },

  // Donut legend
  donutLegend:   { gap: 10 },
  donutRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  donutDot:      { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  donutLabel:    { fontSize: 13, color: '#374151', width: 90 },
  donutBarTrack: { flex: 1, height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  donutBarFill:  { height: 8, borderRadius: 4 },
  donutPct:      { fontSize: 12, fontWeight: '700', color: '#111827', width: 32, textAlign: 'right' },

  // Verified
  verifiedRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  verifiedBarTrack:   { flex: 1, height: 14, backgroundColor: '#F3F4F6', borderRadius: 7, overflow: 'hidden' },
  verifiedBarFill:    { height: 14, backgroundColor: '#16A34A', borderRadius: 7 },
  verifiedPct:        { fontSize: 15, fontWeight: '700', color: '#111827', width: 40, textAlign: 'right' },
  verifiedLegend:     { flexDirection: 'row', justifyContent: 'space-between' },
  verifiedLegendText: { fontSize: 12, color: '#6B7280' },

  // Ranking
  rankRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  rankRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rankBadge:     { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rankBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  rankInfo:      { flex: 1 },
  rankName:      { fontSize: 14, fontWeight: '600', color: '#111827' },
  rankEmail:     { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  rankCountBox:  { alignItems: 'center' },
  rankCount:      { fontSize: 18, fontWeight: '800', color: PRIMARY },
  rankCountLabel: { fontSize: 10, color: '#9CA3AF' },

  // Stars
  stars: { fontSize: 13, color: '#D97706', marginTop: 2 },

  // User list button
  userListBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 8,
  },
  userListBtnIcon:  { fontSize: 24 },
  userListBtnText:  { flex: 1, fontSize: 15, fontWeight: '600', color: '#111827' },
  userListBtnArrow: { fontSize: 22, color: '#D1D5DB' },

  // Empty state
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyIcon:    { fontSize: 48 },
  emptyText:    { fontSize: 16, fontWeight: '600', color: '#374151', textAlign: 'center' },
  emptySubText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
});
