// app/SpotDetailScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { TouristSpot } from '../services/touristSpotService';

type SpotDetailRouteParams = {
  SpotDetail: { spot: TouristSpot };
};

function categoryIcon(kinds: string): string {
  if (kinds.includes('museum'))    return '🏛️';
  if (kinds.includes('monument'))  return '🗿';
  if (kinds.includes('castle'))    return '🏰';
  if (kinds.includes('viewpoint')) return '🌄';
  if (kinds.includes('artwork'))   return '🎨';
  if (kinds.includes('memorial'))  return '🕊️';
  if (kinds.includes('ruins'))     return '🏚️';
  return '📍';
}

export default function SpotDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<SpotDetailRouteParams, 'SpotDetail'>>();
  const { spot } = route.params;

  const category = spot.kinds.split(',')[0].replace(/_/g, ' ');

  function openInMaps() {
    const url = `https://www.google.com/maps/search/?api=1&query=${spot.point.lat},${spot.point.lon}`;
    Linking.openURL(url);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Ícone grande */}
        <View style={styles.iconWrapper}>
          <Text style={styles.iconText}>{categoryIcon(spot.kinds)}</Text>
        </View>

        {/* Nome e categoria */}
        <Text style={styles.name}>{spot.name || 'Nameless Attraction'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{category}</Text>
        </View>

        {/* Informações */}
        <View style={styles.card}>
          <Row label="Latitude"  value={spot.point.lat.toFixed(6)} />
          <Row label="Longitude" value={spot.point.lon.toFixed(6)} />
          <Row label="ID (OSM)"  value={spot.xid} />
        </View>

        {/* Ação: abrir no mapa */}
        <TouchableOpacity style={styles.mapButton} onPress={openInMaps}>
          <Text style={styles.mapButtonText}>🗺️  Open in Google Maps</Text>
        </TouchableOpacity>

        {/* Botão voltar */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Return</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 24, alignItems: 'center' },

  iconWrapper: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: { fontSize: 40 },

  name: {
    fontSize: 22, fontWeight: '700',
    color: '#111827', textAlign: 'center',
    marginBottom: 8,
  },

  badge: {
    backgroundColor: '#EEF2FF', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 4,
    marginBottom: 24,
  },
  badgeText: {
    fontSize: 13, color: '#4F46E5',
    fontWeight: '500', textTransform: 'capitalize',
  },

  card: {
    width: '100%', backgroundColor: '#fff',
    borderRadius: 14, borderWidth: 1,
    borderColor: '#E5E7EB', marginBottom: 16,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  rowLabel: { fontSize: 14, color: '#6B7280' },
  rowValue: { fontSize: 14, color: '#111827', fontWeight: '500' },

  mapButton: {
    width: '100%', backgroundColor: '#4F46E5',
    borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginBottom: 12,
  },
  mapButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  backButton: {
    width: '100%', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingVertical: 14, alignItems: 'center',
  },
  backButtonText: { color: '#6B7280', fontSize: 15 },
});
