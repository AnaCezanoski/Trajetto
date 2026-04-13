import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PLACE_COLORS } from '@/constants/placeColors';
import { useItineraryStore } from '@/hooks/itineraryStore';

const PRIMARY = '#023665';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const formatTime = (time: string) => time?.slice(0, 5) ?? '';

export default function ItinerarioTab() {
  const { itinerary, loading, highlightedPlaceIndex, setHighlightedPlace, setFocusedMapPlace } = useItineraryStore();
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  // Track each card's y offset
  const cardOffsets = useRef<number[]>([]);

  // Scroll to highlighted card when coming from map
  useEffect(() => {
    if (highlightedPlaceIndex === null) return;
    const offset = cardOffsets.current[highlightedPlaceIndex];
    if (offset !== undefined) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, offset - 20), animated: true });
      }, 100);
    }
    // Clear after scrolling so it doesn't re-trigger
    const timer = setTimeout(() => setHighlightedPlace(null), 800);
    return () => clearTimeout(timer);
  }, [highlightedPlaceIndex]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Carregando itinerário...</Text>
      </View>
    );
  }

  if (!itinerary) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>📋</Text>
        <Text style={styles.emptyTitle}>Sem itinerário</Text>
        <Text style={styles.emptyDesc}>Nenhum roteiro encontrado.</Text>
      </View>
    );
  }

  const sorted = [...itinerary.places].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho */}
      <View style={styles.headerCard}>
        <Text style={styles.headerLabel}>Período</Text>
        <Text style={styles.headerDates}>
          {formatDate(itinerary.startDate)} → {formatDate(itinerary.endDate)}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{sorted.length}</Text>
            <Text style={styles.statLabel}>Paradas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {Math.ceil(
                (new Date(itinerary.endDate).getTime() - new Date(itinerary.startDate).getTime())
                / (1000 * 60 * 60 * 24)
              ) + 1}
            </Text>
            <Text style={styles.statLabel}>Dias</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <View style={styles.activeDot} />
            <Text style={styles.statLabel}>Ativo</Text>
          </View>
        </View>
      </View>

      {/* Timeline */}
      <Text style={styles.sectionLabel}>PARADAS DO ROTEIRO</Text>
      <View style={styles.timeline}>
        {sorted.map((place, idx) => {
          const color = PLACE_COLORS[idx % PLACE_COLORS.length];
          const isLast = idx === sorted.length - 1;
          const isHighlighted = highlightedPlaceIndex === idx;

          return (
            <View
              key={idx}
              style={styles.timelineRow}
              onLayout={e => { cardOffsets.current[idx] = e.nativeEvent.layout.y; }}
            >
              {/* Rail */}
              <View style={styles.rail}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                {!isLast && <View style={styles.line} />}
              </View>

              {/* Card */}
              <TouchableOpacity
                style={[
                  styles.card,
                  isLast && { marginBottom: 0 },
                  isHighlighted && { borderWidth: 2, borderColor: color, shadowOpacity: 0.18 },
                ]}
                activeOpacity={0.75}
                onPress={() => {
                  setFocusedMapPlace(idx);
                  router.navigate('/(itinerary)/mapa');
                }}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.orderBadge, { backgroundColor: color }]}>
                    <Text style={styles.orderText}>{idx + 1}</Text>
                  </View>
                  <Text style={[styles.timeText, { color }]}>{formatTime(place.estimatedVisitTime)}</Text>
                </View>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeAddress} numberOfLines={2}>{place.address}</Text>
                <Text style={[styles.mapHint, { color }]}>ver no mapa ↗</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  content: { padding: 20, paddingBottom: 32 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { marginTop: 16, fontSize: 15, color: '#888' },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#888', textAlign: 'center' },

  headerCard: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  headerLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  headerDates: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  activeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ade80', marginBottom: 4 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8a9ab0',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 16,
  },

  timeline: {},
  timelineRow: { flexDirection: 'row' },
  rail: { alignItems: 'center', width: 24, marginRight: 14 },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 18 },
  line: { flex: 1, width: 2, backgroundColor: '#dde4ee', marginTop: 4 },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  orderBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  timeText: { fontSize: 13, fontWeight: '700' },
  placeName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  placeAddress: { fontSize: 13, color: '#8a9ab0', lineHeight: 18, marginBottom: 6 },
  mapHint: { fontSize: 11, fontWeight: '600', opacity: 0.75 },
});
