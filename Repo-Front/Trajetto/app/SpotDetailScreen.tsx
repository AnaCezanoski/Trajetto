import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions, Linking, ScrollView, StyleSheet,
  Text, TouchableOpacity, View, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Place } from '../services/placesService';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PRIMARY = '#006ecf';

// ─── Helpers ────────────────────────────────────────────

function categoryIcon(category: string): string {
  const c = (category || '').toLowerCase();
  if (c.includes('museum'))   return '🏛️';
  if (c.includes('monument')) return '🗿';
  if (c.includes('castle'))   return '🏰';
  if (c.includes('church'))   return '⛪';
  if (c.includes('park'))     return '🌳';
  if (c.includes('square'))   return '🏙️';
  if (c.includes('fountain')) return '⛲';
  if (c.includes('ruins'))    return '🏚️';
  if (c.includes('art'))      return '🎨';
  if (c.includes('view'))     return '🌄';
  return '📍';
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

function formatWalk(m: number) {
  const min = Math.round(m / 80);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)}h ${min % 60}min`;
}

function formatCar(m: number) {
  const min = Math.round(m / 500);
  if (min < 1) return '< 1 min';
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)}h ${min % 60}min`;
}

function wheelchairLabel(value: string) {
  if (!value) return null;
  const map: Record<string, string> = {
    yes:     '♿ Totalmente acessível',
    limited: '♿ Parcialmente acessível',
    no:      '🚫 Não acessível',
  };
  return map[value] || value;
}

function parseOpeningHours(raw: string): { period: string; hours: string }[] {
  if (!raw) return [];
  return raw.split(';').map(s => {
    const trimmed = s.trim();
    const colonIdx = trimmed.lastIndexOf(':');
    if (colonIdx === -1) return { period: trimmed, hours: '' };
    // Ex: "Mar 30-Sep 30: 08:30-19:15"
    const period = trimmed.slice(0, colonIdx - 6).trim();
    const hours  = trimmed.slice(colonIdx - 5).trim();
    return { period, hours };
  }).filter(s => s.period || s.hours);
}

// ─── Subcomponentes ──────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function InfoRow({ icon, label, value, onPress }: {
  icon: React.ReactNode; label: string; value: string; onPress?: () => void;
}) {
  if (!value) return null;
  return (
    <TouchableOpacity style={styles.infoRow} onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.infoIconContainer}>
        {typeof icon === 'string' ? <Text style={styles.infoIconText}>{icon}</Text> : icon}
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, onPress && styles.infoLink]}>{value}</Text>
      </View>
      {onPress && <Text style={styles.infoArrow}>›</Text>}
    </TouchableOpacity>
  );
}

// ─── Tela principal ──────────────────────────────────────

export default function SpotDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ spot: string }>();
  const spot: Place = JSON.parse(params.spot);

  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setDistance(haversineMeters(loc.coords.latitude, loc.coords.longitude, spot.latitude, spot.longitude));
    })();
  }, []);

  const region = {
    latitude: spot.latitude,
    longitude: spot.longitude,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  };

  const openMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`;
    Linking.openURL(url).catch(() => Alert.alert('Erro', 'Não foi possível abrir o Google Maps'));
  };

  const openWebsite = () => {
    if (spot.website) Linking.openURL(spot.website).catch(() => {});
  };

  const callPhone = () => {
    if (spot.phone) Linking.openURL(`tel:${spot.phone}`).catch(() => {});
  };

  const openWikipedia = () => {
    if (spot.wikipedia) {
      const lang = spot.wikipedia.split(':')[0];
      const title = spot.wikipedia.split(':')[1]?.replace(/ /g, '_');
      Linking.openURL(`https://${lang}.wikipedia.org/wiki/${title}`).catch(() => {});
    }
  };

  const hours = parseOpeningHours(spot.openingHours);
  const wc    = wheelchairLabel(spot.wheelchair || '');

  return (
    <View style={styles.safe}>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={32} color={'white'} />
            </TouchableOpacity>
            <Text style={styles.headerText}>Explorar</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Mapa interativo */}
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={region}
          scrollEnabled
          zoomEnabled
        >
          <Marker
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            title={spot.name}
            description={spot.category}
          />
        </MapView>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Text style={styles.iconText}>{categoryIcon(spot.category)}</Text>
          </View>
          <View style={styles.titleText}>
            <Text style={styles.name}>{spot.name}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{spot.category}</Text>
              </View>
              {spot.fee === 'no' && (
                <View style={[styles.badge, styles.badgeFree]}>
                  <Text style={styles.badgeText}>🆓 Gratuito</Text>
                </View>
              )}
              {spot.fee === 'yes' && (
                <View style={[styles.badge, styles.badgePaid]}>
                  <Text style={styles.badgeText}>💰 Pago</Text>
                </View>
              )}
              {wc && (
                <View style={[styles.badge, styles.badgeWc]}>
                  <Text style={styles.badgeText}>{wc}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ─── Distância e tempo ─── */}
        {distance !== null && (
          <>
            <SectionTitle>Como chegar</SectionTitle>
            <View style={styles.card}>
              <View style={styles.distanceRow}>
                <View style={styles.distanceCard}>
                  <Ionicons name="navigate-outline" size={24} color="#6B7280" />
                  <Text style={styles.distanceValue}>{formatDistance(distance)}</Text>
                  <Text style={styles.distanceLabel}>distância</Text>
                </View>
                <View style={styles.distanceDivider} />
                <View style={styles.distanceCard}>
                  <Ionicons name="walk-outline" size={24} color="#6B7280" />
                  <Text style={styles.distanceValue}>{formatWalk(distance)}</Text>
                  <Text style={styles.distanceLabel}>a pé</Text>
                </View>
                <View style={styles.distanceDivider} />
                <View style={styles.distanceCard}>
                  <Ionicons name="car-outline" size={24} color="#6B7280" />
                  <Text style={styles.distanceValue}>{formatCar(distance)}</Text>
                  <Text style={styles.distanceLabel}>de carro</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.mapsBtn} onPress={openMaps} activeOpacity={0.85}>
                <View style={styles.mapsBtnContent}>
                  <Ionicons name="map-outline" size={20} color="white" />
                  <Text style={styles.mapsBtnText}>Abrir rota no Google Maps</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ─── Informações gerais ─── */}
        <SectionTitle>Informações</SectionTitle>
        <View style={styles.card}>
          <InfoRow icon={<Ionicons name="location-outline" size={20} color="#9CA3AF" />} label="Endereço"  value={spot.address} />
          <InfoRow icon={<Ionicons name="globe-outline" size={20} color="#9CA3AF" />} label="Website"   value={spot.website || ''} onPress={spot.website ? openWebsite : undefined} />
          <InfoRow icon={<Ionicons name="call-outline" size={20} color="#9CA3AF" />} label="Telefone"  value={spot.phone || ''}   onPress={spot.phone   ? callPhone   : undefined} />
          <InfoRow icon={<Ionicons name="earth-outline" size={20} color="#9CA3AF" />} label="Wikipedia" value={spot.wikipedia || ''} onPress={spot.wikipedia ? openWikipedia : undefined} />
          <InfoRow icon={<Ionicons name="pin-outline" size={20} color="#9CA3AF" />} label="Wikidata"  value={spot.wikidata || ''} />
          <InfoRow icon={<Ionicons name="map-outline" size={20} color="#9CA3AF" />} label="Coordenadas" value={`${spot.latitude.toFixed(5)}, ${spot.longitude.toFixed(5)}`} />
        </View>

        {/* ─── Horários ─── */}
        {hours.length > 0 && (
          <>
            <SectionTitle>Horários de funcionamento</SectionTitle>
            <View style={styles.card}>
              {hours.map((h, i) => (
                <View key={i} style={[styles.hourRow, i < hours.length - 1 && styles.hourRowBorder]}>
                  <Text style={styles.hourPeriod}>{h.period}</Text>
                  <Text style={styles.hourValue}>{h.hours}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ─── Perfis ─── */}
        {spot.profiles?.length > 0 && (
          <>
            <SectionTitle>Indicado para</SectionTitle>
            <View style={styles.profilesRow}>
              {spot.profiles.map((p, i) => (
                <View key={i} style={styles.profileChip}>
                  <Text style={styles.profileChipText}>👤 {p}</Text>
                </View>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { paddingBottom: 40 },

  map: { width, height: 220 },

  header: { flexDirection: 'row', padding: 20, gap: 14, alignItems: 'flex-start' },
  iconWrapper: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconText: { fontSize: 30 },
  titleText: { flex: 1 },
  name: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8, lineHeight: 26 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeFree: { backgroundColor: '#F0FDF4' },
  badgePaid: { backgroundColor: '#FFF7ED' },
  badgeWc:   { backgroundColor: '#F5F3FF' },
  badgeText: { fontSize: 12, color: '#374151', fontWeight: '500' },

  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginHorizontal: 16, marginBottom: 8, marginTop: 4,
  },

  card: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
    overflow: 'hidden',
  },

  // Distância
  distanceRow: { flexDirection: 'row', padding: 16 },
  distanceCard: { flex: 1, alignItems: 'center', gap: 4 },
  distanceValue: { fontSize: 15, fontWeight: '700', color: '#111827' },
  distanceLabel: { fontSize: 11, color: '#6B7280' },
  distanceDivider: { width: 1, height: 48, backgroundColor: '#F3F4F6', alignSelf: 'center' },
  mapsBtn: {
    margin: 12, marginTop: 0,
    backgroundColor: PRIMARY, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  mapsBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapsBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Info rows
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12,
  },
  infoIconContainer: { width: 28, alignItems: 'center', justifyContent: 'center' },
  infoIconText: { fontSize: 20 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
  infoLink: { color: PRIMARY, textDecorationLine: 'underline' },
  infoArrow: { fontSize: 18, color: '#D1D5DB' },

  // Horários
  hourRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  hourRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  hourPeriod: { fontSize: 13, color: '#6B7280', flex: 1 },
  hourValue: { fontSize: 13, color: '#111827', fontWeight: '600' },

  // Perfis
  profilesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16, marginBottom: 16 },
  profileChip: { backgroundColor: '#F0F4FF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#C7D2FE' },
  profileChipText: { fontSize: 13, color: PRIMARY, fontWeight: '600' },

  backButton: {
    marginHorizontal: 16, borderRadius: 12, borderWidth: 1,
    borderColor: '#E5E7EB', paddingVertical: 14,
    alignItems: 'center', backgroundColor: '#fff',
  },
  backButtonText: { color: '#6B7280', fontSize: 15, fontWeight: '500' },
  headerWrapper: { paddingHorizontal: 24, backgroundColor: PRIMARY },
  headerRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', height: 56 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  headerBackBtn: { paddingVertical: 4, paddingRight: 8, marginLeft: -12 },
  headerCenter: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  headerText: { fontSize: 18, fontWeight: '700', color: 'white' },
});