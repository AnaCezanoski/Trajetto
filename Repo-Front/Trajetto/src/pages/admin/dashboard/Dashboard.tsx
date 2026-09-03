import React from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminAccent, useColors } from '@/src/theme';
import AsyncState from '@/src/components/AsyncState/AsyncState';
import BarChart from '@/src/components/charts/BarChart/BarChart';
import DonutLegend from '@/src/components/charts/DonutLegend/DonutLegend';
import StatCard from '@/src/components/charts/StatCard/StatCard';
import Section from '@/src/components/charts/Section/Section';
import RankRow from '@/src/components/charts/RankRow/RankRow';
import { useDashboard } from './hooks/useDashboard';
import { umaCasa } from './dashboardFormat';
import BlockTitle from './components/BlockTitle/BlockTitle';
import { styles } from './styles/styles';

export default function Dashboard() {
  const colors = useColors();
  const s = styles(colors);
  const {
    overview, countries, profiles, ageGroups,
    perClient, itinerary, perMonth,
    categories, visited, topRated, commented,
    loading, refreshing, error, verifiedPct,
    load, onRefresh,
  } = useDashboard();

  if (loading || error) {
    return (
      <AsyncState
        style={s.center}
        loading={loading}
        loadingText="Carregando dashboard..."
        spinnerColor={colors.primaryDark}
        error={error}
        onRetry={load}
      />
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryDark} />}
      >
        <View style={s.header}>
          <Text style={s.headerTitle}>Dashboard</Text>
          <Text style={s.headerSub}>Visão geral da plataforma Trajetto</Text>
        </View>

        <BlockTitle>Usuários</BlockTitle>

        <View style={s.statsGrid}>
          <StatCard icon="👥" label="Total de usuários" value={overview?.totalUsers ?? 0} color={colors.primaryDark} />
          <StatCard icon="👤" label="Clientes" value={overview?.totalClients ?? 0} color={adminAccent.blue} />
          <StatCard icon="🛡️" label="Administradores" value={overview?.totalAdmins ?? 0} color={adminAccent.violet} />
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
          <Section title={`Países (${countries.length} países)`}>
            <BarChart data={countries} labelKey="country" valueKey="count" />
          </Section>
        )}

        <BlockTitle>Roteiros</BlockTitle>

        <View style={s.statsGrid}>
          <StatCard icon="🗺️" label="Roteiros criados" value={itinerary?.totalItineraries ?? 0} color={adminAccent.amber} />
          <StatCard icon="📅" label="Duração média" value={`${umaCasa(itinerary?.avgDurationDays)} dias`} color={adminAccent.cyan} />
          <StatCard icon="⭐" label="Nota média" value={`${umaCasa(itinerary?.avgRating)} / 5`} color={adminAccent.violet} />
          <StatCard icon="📝" label="Avaliados" value={itinerary?.ratedCount ?? 0} color={adminAccent.green}
            sub={`${itinerary?.unratedCount ?? 0} sem avaliação`} />
        </View>

        {perMonth.length > 0 && (
          <Section title="Roteiros criados por mês">
            <BarChart data={perMonth} labelKey="month" valueKey="count" limit={12} />
          </Section>
        )}

        {perClient && perClient.topClients.length > 0 && (
          <Section title="Clientes com mais roteiros">
            <View>
              {perClient.topClients.map((c, i, arr) => (
                <RankRow
                  key={i}
                  index={i}
                  isLast={i === arr.length - 1}
                  name={c.user}
                  subtitle={c.email}
                  count={c.count}
                  countLabel={c.count === 1 ? 'roteiro' : 'roteiros'}
                />
              ))}
            </View>
          </Section>
        )}

        {perClient && perClient.clientsWithoutItinerary > 0 && (
          <Section title="Clientes sem roteiro">
            <View style={s.noItineraryBox}>
              <Text style={s.noItineraryCount}>{perClient.clientsWithoutItinerary}</Text>
              <Text style={s.noItineraryLabel}>
                clientes ainda não geraram nenhum roteiro
              </Text>
              <Text style={s.noItinerarySub}>
                {perClient.clientsWithItinerary} já geraram pelo menos um
              </Text>
            </View>
          </Section>
        )}

        <BlockTitle>Locais</BlockTitle>

        {categories.length > 0 && (
          <Section title={`Categorias (${categories.length})`}>
            <DonutLegend data={categories} labelKey="category" valueKey="count" labelWidth={124} />
          </Section>
        )}

        {visited.length > 0 && (
          <Section title="Locais que mais aparecem em roteiros">
            <View>
              {visited.map((p, i, arr) => (
                <RankRow
                  key={i}
                  index={i}
                  isLast={i === arr.length - 1}
                  name={p.name}
                  count={p.count}
                  countLabel={p.count === 1 ? 'roteiro' : 'roteiros'}
                />
              ))}
            </View>
          </Section>
        )}

        {topRated.length > 0 && (
          <Section title="Locais com melhor avaliação">
            <View>
              {topRated.map((p, i, arr) => (
                <RankRow
                  key={i}
                  index={i}
                  isLast={i === arr.length - 1}
                  name={p.name}
                  subtitle={`${p.totalRatings} ${p.totalRatings === 1 ? 'avaliação' : 'avaliações'}`}
                  count={umaCasa(p.avgRating)}
                  countLabel="de 5"
                />
              ))}
            </View>
          </Section>
        )}

        {commented.length > 0 && (
          <Section title="Locais mais comentados">
            <View>
              {commented.map((p, i, arr) => (
                <RankRow
                  key={i}
                  index={i}
                  isLast={i === arr.length - 1}
                  name={p.name}
                  count={p.commentCount}
                  countLabel={p.commentCount === 1 ? 'comentário' : 'comentários'}
                />
              ))}
            </View>
          </Section>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
