import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity,
  View, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Place } from '../services/placesService';

const { width } = Dimensions.get('window');
const PRIMARY = '#023665';

function categoryIcon(category: string): string {
  const c = category.toLowerCase();
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

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
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
  const spot: Place = JSON.parse(params.spot);

  const region = {
    latitude: spot.latitude,
    longitude: spot.longitude,
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
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={2}>{spot.name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{spot.category}</Text>
            </View>
          </View>
        </View>

        {/* Informações */}
        <View style={styles.card}>
          <Row label="Endereço"       value={spot.address} />
          <Row label="Horário"        value={spot.openingHours} />
          <Row label="Entrada"        value={spot.fee} />
          <Row label="Latitude"       value={spot.latitude.toFixed(6)} />
          <Row label="Longitude"      value={spot.longitude.toFixed(6)} />
          {spot.profiles?.length > 0 && (
            <Row label="Perfis"       value={spot.profiles.join(', ')} />
          )}
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { paddingBottom: 32 },
  map: { width, height: 240 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 14 },
  iconWrapper: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconText: { fontSize: 28 },
  headerText: { flex: 1 },
  name: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3 },
  badgeText: { fontSize: 12, color: PRIMARY, fontWeight: '500', textTransform: 'capitalize' },
  card: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowLabel: { fontSize: 14, color: '#6B7280' },
  rowValue: { fontSize: 14, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' },
  backButton: { marginHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 14, alignItems: 'center', backgroundColor: '#fff' },
  backButtonText: { color: '#6B7280', fontSize: 15 },
});