// app/SpotDetailScreen.tsx

import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

const { width } = Dimensions.get('window');

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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function SpotDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ spot: string }>();
  const spot = JSON.parse(params.spot);

  const category = spot.kinds.split(',')[0].replace(/_/g, ' ');

  const region = {
    latitude: spot.point.lat,
    longitude: spot.point.lon,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Mapa */}
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={region}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{ latitude: spot.point.lat, longitude: spot.point.lon }}
            title={spot.name || 'Nameless tourist attraction'}
            description={category}
          />
        </MapView>

        {/* Ícone e nome */}
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Text style={styles.iconText}>{categoryIcon(spot.kinds)}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={2}>
              {spot.name || 'Nameless tourist attraction'}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{category}</Text>
            </View>
          </View>
        </View>

        {/* Informações */}
        <View style={styles.card}>
          <Row label="Latitude"  value={spot.point.lat.toFixed(6)} />
          <Row label="Longitude" value={spot.point.lon.toFixed(6)} />
          <Row label="ID (OSM)"  value={spot.xid} />
        </View>

        {/* Botão voltar */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Return</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { paddingBottom: 32 },

  // Mapa ocupa toda a largura, sem padding
  map: {
    width: width,
    height: 240,
  },

  // Header (ícone + nome) abaixo do mapa
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 14,
  },
  iconWrapper: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: { fontSize: 28 },
  headerText: { flex: 1 },
  name: {
    fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12, color: '#023665',
    fontWeight: '500', textTransform: 'capitalize',
  },

  // Card de infos
  card: {
    marginHorizontal: 16,
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  rowLabel: { fontSize: 14, color: '#6B7280' },
  rowValue: { fontSize: 14, color: '#111827', fontWeight: '500' },

  backButton: {
    marginHorizontal: 16,
    borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    paddingVertical: 14, alignItems: 'center',
    backgroundColor: '#fff',
  },
  backButtonText: { color: '#6B7280', fontSize: 15 },
});
