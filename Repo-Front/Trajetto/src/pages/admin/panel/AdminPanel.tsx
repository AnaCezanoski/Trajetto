import React from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { adminAccent, useColors } from '@/src/theme';
import AsyncState from '@/src/components/AsyncState/AsyncState';
import { useAdminPanel } from './hooks/useAdminPanel';
import { styles } from './styles/styles';
import BarChart from '@/src/components/charts/BarChart/BarChart';
import DonutLegend from '@/src/components/charts/DonutLegend/DonutLegend';
import StatCard from '@/src/components/charts/StatCard/StatCard';
import Section from '@/src/components/charts/Section/Section';
import StarRating from './components/StarRating/StarRating';
import RankRow from '@/src/components/charts/RankRow/RankRow';

export default function AdminPanel() {
  const router = useRouter();
  const colors = useColors();
  const s = styles(colors);
  const {
    activeTab, setActiveTab,
    overview, countries, profiles, ageGroups,
    itinOv, perMonth, categories, topRated, mostComment, mostVisited,
    loading, refreshing, error, verifiedPct,
    userFirstName, logout, load, onRefresh,
  } = useAdminPanel();

  return (
    <SafeAreaView style={s.safe}>

      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Painel Admin</Text>
          <Text style={s.headerSub}>Olá, {userFirstName}</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={s.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={s.quickActions}>
        <TouchableOpacity style={s.quickCard} onPress={() => router.push('/UserListScreen')} activeOpacity={0.85}>
          <Text style={s.quickLabel}>Usuários</Text>
          <Text style={s.quickCount}>{overview?.totalUsers ?? '—'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.quickCard, s.quickCardViolet]} activeOpacity={0.85}>
          <Text style={s.quickLabel}>Roteiros</Text>
          <Text style={s.quickCount}>{overview?.totalItineraries ?? '—'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.quickCard, s.quickCardGreen]} activeOpacity={0.85}>
          <Text style={s.quickLabel}>Verificados</Text>
          <Text style={s.quickCount}>{overview ? `${verifiedPct}%` : '—'}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.tabBar}>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === 'usuarios' && s.tabBtnActive]}
          onPress={() => setActiveTab('usuarios')}
          activeOpacity={0.8}
        >
          <Text style={[s.tabText, activeTab === 'usuarios' && s.tabTextActive]}>👥 Usuários</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === 'roteiros' && s.tabBtnActive]}
          onPress={() => setActiveTab('roteiros')}
          activeOpacity={0.8}
        >
          <Text style={[s.tabText, activeTab === 'roteiros' && s.tabTextActive]}>🗺️ Roteiros</Text>
        </TouchableOpacity>
      </View>

      <AsyncState
        style={s.center}
        loading={loading}
        loadingText="Carregando dados..."
        spinnerColor={colors.primaryDark}
        error={error}
        onRetry={load}
      >
        {activeTab === 'usuarios' ? (
          <ScrollView
            contentContainerStyle={s.container}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryDark} />}
          >
            <View style={s.statsGrid}>
              <StatCard icon="👥" label="Total usuários" value={overview?.totalUsers ?? 0} color={colors.primaryDark} />
              <StatCard icon="🛡️" label="Admins" value={overview?.totalAdmins ?? 0} color={adminAccent.violet} />
              <StatCard icon="🗺️" label="Roteiros" value={overview?.totalItineraries ?? 0} color={adminAccent.amber} />
              <StatCard icon="✅" label="Verificados" value={overview?.verifiedUsers ?? 0} color={adminAccent.green} sub={`${verifiedPct}% do total`} />
              <StatCard icon="⏳" label="Não verificados" value={overview?.unverifiedUsers ?? 0} color={adminAccent.red} />
              {overview?.avgAge && (
                <StatCard icon="🎂" label="Idade média" value={`${overview.avgAge} anos`} color={adminAccent.cyan} />
              )}
            </View>

            <Section title="Taxa de verificação de e-mail">
              <View style={s.verifiedRow}>
                <View style={s.verifiedBarTrack}>
                  <View style={[s.verifiedBarFill, { width: `${verifiedPct}%` }]} />
                </View>
                <Text style={s.verifiedPct}>{verifiedPct}%</Text>
              </View>
              <View style={s.verifiedLegend}>
                <Text style={s.verifiedLegendText}>✅ {overview?.verifiedUsers} verificados</Text>
                <Text style={s.verifiedLegendText}>⏳ {overview?.unverifiedUsers} pendentes</Text>
              </View>
            </Section>

            {profiles.length > 0 && (
              <Section title="Perfis de viajante">
                <DonutLegend data={profiles} labelKey="profile" valueKey="count" />
              </Section>
            )}

            {ageGroups.filter((g) => g.count > 0).length > 0 && (
              <Section title="Faixas etárias">
                <BarChart data={ageGroups.filter((g) => g.count > 0)} labelKey="group" valueKey="count" />
              </Section>
            )}

            {countries.length > 0 && (
              <Section title={`Países (${countries.length})`}>
                <BarChart data={countries} labelKey="country" valueKey="count" />
              </Section>
            )}

            <TouchableOpacity
              style={s.userListBtn}
              onPress={() => router.push('/UserListScreen')}
              activeOpacity={0.85}
            >
              <Text style={s.userListBtnIcon}>👥</Text>
              <Text style={s.userListBtnText}>Ver lista completa de usuários</Text>
              <Text style={s.userListBtnArrow}>›</Text>
            </TouchableOpacity>
          </ScrollView>

        ) : (
          <ScrollView
            contentContainerStyle={s.container}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryDark} />}
          >
            <View style={s.statsGrid}>
              <StatCard icon="🗺️" label="Total roteiros" value={itinOv?.totalItineraries ?? 0} color={colors.primaryDark} />
              <StatCard icon="📅" label="Duração média" value={itinOv?.avgDurationDays != null ? `${itinOv.avgDurationDays} dias` : '—'} color={adminAccent.blue} />
              <StatCard icon="⭐" label="Nota média" value={itinOv?.avgRating != null ? `${itinOv.avgRating}/5` : '—'} color={adminAccent.amber} />
              <StatCard icon="✅" label="Com avaliação" value={itinOv?.ratedCount ?? 0} color={adminAccent.green} sub={`${itinOv?.unratedCount ?? 0} sem nota`} />
            </View>

            {perMonth.length > 0 && (
              <Section title="Roteiros gerados por mês">
                <BarChart data={perMonth} labelKey="month" valueKey="count" />
              </Section>
            )}

            {categories.length > 0 && (
              <Section title="Locais por categoria">
                <DonutLegend data={categories} labelKey="category" valueKey="count" />
              </Section>
            )}

            {topRated.length > 0 && (
              <Section title="Locais mais bem avaliados">
                <View>
                  {topRated.slice(0, 8).map((item, i, arr) => (
                    <RankRow
                      key={i}
                      index={i}
                      isLast={i === arr.length - 1}
                      name={item.name}
                      subtitle={<StarRating value={item.avgRating} />}
                      count={item.avgRating}
                      countLabel={`${item.totalRatings} aval.`}
                    />
                  ))}
                </View>
              </Section>
            )}

            {mostComment.length > 0 && (
              <Section title="Locais com mais comentários">
                <View>
                  {mostComment.slice(0, 8).map((item, i, arr) => (
                    <RankRow
                      key={i}
                      index={i}
                      isLast={i === arr.length - 1}
                      name={item.name}
                      subtitle={`💬 ${item.commentCount} ${item.commentCount === 1 ? 'comentário' : 'comentários'}`}
                      count={item.commentCount}
                      countLabel="coment."
                    />
                  ))}
                </View>
              </Section>
            )}

            {mostVisited.length > 0 && (
              <Section title="Locais mais incluídos em roteiros">
                <BarChart data={mostVisited} labelKey="name" valueKey="count" />
              </Section>
            )}

            {topRated.length === 0 && mostComment.length === 0 && mostVisited.length === 0 && (
              <View style={s.emptyBox}>
                <Text style={s.emptyIcon}>📊</Text>
                <Text style={s.emptyText}>Nenhum dado de locais disponível ainda.</Text>
                <Text style={s.emptySubText}>Os dados aparecerão conforme os usuários gerarem roteiros e avaliarem locais.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </AsyncState>
    </SafeAreaView>
  );
}
