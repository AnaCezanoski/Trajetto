// app/ExploreScreen.tsx

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, StyleSheet,
  Alert, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { searchByCity, TouristSpot } from '../services/touristSpotService';

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

function SpotCard({ spot, onPress }: { spot: TouristSpot; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardIcon}>
        <Text style={styles.cardIconText}>{categoryIcon(spot.kinds)}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>{spot.name || 'Nameless tourist attraction'}</Text>
        <Text style={styles.cardKind} numberOfLines={1}>
          {spot.kinds.split(',')[0].replace(/_/g, ' ')}
        </Text>
        <Text style={styles.cardCoords}>
          {spot.point.lat.toFixed(4)}, {spot.point.lon.toFixed(4)}
        </Text>
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const router = useRouter();

  const [query, setQuery]       = useState('');
  const [spots, setSpots]       = useState<TouristSpot[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [cityName, setCityName] = useState('');

  async function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setSearched(false);
    setSpots([]);
    try {
      const results = await searchByCity(trimmed, { radius: 10000 });
      setSpots(results);
      setCityName(trimmed);
      setSearched(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }

  function handleSpotPress(spot: TouristSpot) {
    // Expo Router só aceita strings nos params — serializamos o objeto
    router.push({ pathname: '/SpotDetailScreen', params: { spot: JSON.stringify(spot) } });
  }

  function renderEmpty() {
    if (loading) return null;
    if (!searched) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>Explore destinations</Text>
          <Text style={styles.emptyText}>Type the name of a city to find tourist attractions.</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>😕</Text>
        <Text style={styles.emptyTitle}>No tourist attractions found</Text>
        <Text style={styles.emptyText}>Try increasing the search radius or searching for another city.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSubtitle}>Discover tourist attractions</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="🔍  Enter a city..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.searchButton, loading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={loading}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {searched && !loading && (
          <Text style={styles.resultsLabel}>
            {spots.length} tourist attractions found in <Text style={styles.resultsCity}>{cityName}</Text>
          </Text>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#023665" />
            <Text style={styles.loadingText}>Looking for tourist attractions...</Text>
          </View>
        )}

        <FlatList
          data={spots}
          keyExtractor={(item) => item.xid}
          renderItem={({ item }) => (
            <SpotCard spot={item} onPress={() => handleSpotPress(item)} />
          )}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={spots.length === 0 ? styles.listEmpty : styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 24, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  searchContainer: { flexDirection: 'row', gap: 8, marginBottom: 12, marginTop: 12 },
  input: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#111827',
  },
  searchButton: { backgroundColor: '#023665', borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center' },
  searchButtonDisabled: { backgroundColor: '#A5B4FC' },
  searchButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  resultsLabel: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  resultsCity: { fontWeight: '600', color: '#023665' },
  loadingContainer: { alignItems: 'center', marginTop: 48, gap: 12 },
  loadingText: { fontSize: 14, color: '#6B7280' },
  list: { paddingBottom: 32 },
  listEmpty: { flex: 1 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#EEF2FF', alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  cardIconText: { fontSize: 22 },
  cardContent: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  cardKind: { fontSize: 12, color: '#6B7280', marginTop: 2, textTransform: 'capitalize' },
  cardCoords: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  cardArrow: { fontSize: 22, color: '#D1D5DB', marginLeft: 8 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
});
