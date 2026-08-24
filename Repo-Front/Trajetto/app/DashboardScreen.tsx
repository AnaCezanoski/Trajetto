import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  statsService, Overview, CountryStats,
  ProfileStats, ItineraryStats, AgeGroupStats,
} from '../services';
import { getErrorMessage } from '../utils/apiError';

const PRIMARY = '#023665';
const COLORS = ['#023665','#2563EB','#7C3AED','#DB2777','#D97706','#16A34A','#0891B2','#DC2626'];

// ─── Mini bar chart ───────────────────────────────────────
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

// ─── Donut chart simples ──────────────────────────────────
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

// ─── Stat card ────────────────────────────────────────────
function StatCard({ icon, label, value, color, sub }: {
  icon: string; label: string; value: string | number;
  color?: string; sub?: string;
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

// ─── Section ─────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────
export default function DashboardScreen() {
  const [overview,    setOverview]    = useState<Overview | null>(null);
  const [countries,   setCountries]   = useState<CountryStats[]>([]);
  const [profiles,    setProfiles]    = useState<ProfileStats[]>([]);
  const [itineraries, setItineraries] = useState<ItineraryStats[]>([]);
  const [ageGroups,   setAgeGroups]   = useState<AgeGroupStats[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState('');

  const load = async () => {
    try {
      const [ov, co, pr, it, ag] = await Promise.all([
        statsService.getOverview(),
        statsService.getCountries(),
        statsService.getTravelerProfiles(),
        statsService.getItinerariesPerUser(),
        statsService.getAgeGroups(),
      ]);
      setOverview(ov);
      setCountries(co);
      setProfiles(pr);
      setItineraries(it);
      setAgeGroups(ag);
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const verifiedPct = overview && overview.totalUsers > 0
    ? Math.round((overview.verifiedUsers / overview.totalUsers) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSub}>Visão geral da plataforma Trajetto</Text>
        </View>

        {/* ─── Overview cards ─── */}
        <View style={styles.statsGrid}>
          <StatCard icon="👥" label="Total de usuários" value={overview?.totalUsers ?? 0} color={PRIMARY} />
          <StatCard icon="👤" label="Clientes"          value={overview?.totalClients ?? 0} color="#2563EB" />
          <StatCard icon="🛡️" label="Administradores"  value={overview?.totalAdmins ?? 0}  color="#7C3AED" />
          <StatCard icon="🗺️" label="Roteiros gerados" value={overview?.totalItineraries ?? 0} color="#D97706" />
          <StatCard icon="✅" label="Verificados"      value={overview?.verifiedUsers ?? 0}   color="#16A34A" sub={`${verifiedPct}% do total`} />
          <StatCard icon="⏳" label="Não verificados"  value={overview?.unverifiedUsers ?? 0} color="#DC2626" />
          {overview?.avgAge && (
            <StatCard icon="🎂" label="Idade média"    value={`${overview.avgAge} anos`} color="#0891B2" />
          )}
        </View>

        {/* ─── Verificação ─── */}
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

        {/* ─── Perfis de viajante ─── */}
        {profiles.length > 0 && (
          <Section title="Perfis de viajante">
            <DonutLegend data={profiles} labelKey="profile" valueKey="count" />
          </Section>
        )}

        {/* ─── Faixas etárias ─── */}
        {ageGroups.filter(g => g.count > 0).length > 0 && (
          <Section title="Faixas etárias">
            <BarChart data={ageGroups.filter(g => g.count > 0)} labelKey="group" valueKey="count" />
          </Section>
        )}

        {/* ─── Países ─── */}
        {countries.length > 0 && (
          <Section title={`Países (${countries.length} países)`}>
            <BarChart data={countries} labelKey="country" valueKey="count" />
          </Section>
        )}

        {/* ─── Roteiros por usuário ─── */}
        {itineraries.filter(i => i.count > 0).length > 0 && (
          <Section title="Usuários com mais roteiros">
            <View>
              {itineraries.filter(i => i.count > 0).slice(0, 10).map((item, i) => (
                <View key={i} style={[styles.rankRow, i < itineraries.length - 1 && styles.rankRowBorder]}>
                  <View style={[styles.rankBadge, { backgroundColor: COLORS[i % COLORS.length] }]}>
                    <Text style={styles.rankBadgeText}>{i + 1}</Text>
                  </View>
                  <View style={styles.rankInfo}>
                    <Text style={styles.rankName} numberOfLines={1}>{item.user}</Text>
                    <Text style={styles.rankEmail} numberOfLines={1}>{item.email}</Text>
                  </View>
                  <View style={styles.rankCountBox}>
                    <Text style={styles.rankCount}>{item.count}</Text>
                    <Text style={styles.rankCountLabel}>{item.count === 1 ? 'roteiro' : 'roteiros'}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* ─── Usuários sem roteiro ─── */}
        {itineraries.filter(i => i.count === 0).length > 0 && (
          <Section title="Usuários sem roteiro">
            <View style={styles.noItineraryBox}>
              <Text style={styles.noItineraryCount}>
                {itineraries.filter(i => i.count === 0).length}
              </Text>
              <Text style={styles.noItineraryLabel}>usuários ainda não geraram nenhum roteiro</Text>
            </View>
          </Section>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6F9' },
  container: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  loadingText: { fontSize: 14, color: '#6B7280' },
  errorIcon: { fontSize: 48 },
  errorText: { fontSize: 15, color: '#374151', textAlign: 'center' },
  retryBtn: { backgroundColor: PRIMARY, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { color: '#fff', fontWeight: '700' },

  header: { marginBottom: 20, paddingTop: 8 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 14, color: '#6B7280', marginTop: 2 },

  // Stat cards
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  statCard: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 16, width: '47%',
    shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
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
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, shadowColor: '#000',
    shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },

  // Bar chart
  barChart: { gap: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { fontSize: 12, color: '#374151', width: 72 },
  barTrack: { flex: 1, height: 10, backgroundColor: '#F3F4F6', borderRadius: 5, overflow: 'hidden' },
  barFill:  { height: 10, borderRadius: 5 },
  barValue: { fontSize: 12, fontWeight: '700', color: '#111827', width: 24, textAlign: 'right' },

  // Donut legend
  donutLegend: { gap: 10 },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  donutDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  donutLabel: { fontSize: 13, color: '#374151', width: 90 },
  donutBarTrack: { flex: 1, height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  donutBarFill:  { height: 8, borderRadius: 4 },
  donutPct: { fontSize: 12, fontWeight: '700', color: '#111827', width: 32, textAlign: 'right' },

  // Verified
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  verifiedBarTrack: { flex: 1, height: 14, backgroundColor: '#F3F4F6', borderRadius: 7, overflow: 'hidden' },
  verifiedBarFill:  { height: 14, backgroundColor: '#16A34A', borderRadius: 7 },
  verifiedPct: { fontSize: 15, fontWeight: '700', color: '#111827', width: 40, textAlign: 'right' },
  verifiedLegend: { flexDirection: 'row', justifyContent: 'space-between' },
  verifiedLegendText: { fontSize: 12, color: '#6B7280' },

  // Rank
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  rankRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rankBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rankBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  rankInfo: { flex: 1 },
  rankName:  { fontSize: 14, fontWeight: '600', color: '#111827' },
  rankEmail: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  rankCountBox: { alignItems: 'center' },
  rankCount:      { fontSize: 18, fontWeight: '800', color: PRIMARY },
  rankCountLabel: { fontSize: 10, color: '#9CA3AF' },

  // No itinerary
  noItineraryBox: { alignItems: 'center', paddingVertical: 8 },
  noItineraryCount: { fontSize: 40, fontWeight: '800', color: '#D97706' },
  noItineraryLabel: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 4 },
});