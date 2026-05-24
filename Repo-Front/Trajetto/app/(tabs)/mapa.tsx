import { PLACE_COLORS } from '@/constants/placeColors';
import { useAuth } from '@/context/AuthContext';
import { useItineraryStore } from '@/hooks/itineraryStore';
import { RouteService } from '@/services/routeService';
import { placesService, Place } from '@/services/placesService';
import { MaterialIcons } from '@expo/vector-icons';
import polyline from '@mapbox/polyline';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet, Text, TextInput, TouchableOpacity,
  View, FlatList, Keyboard, Modal, ScrollView, ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

type LatLng = { latitude: number; longitude: number };
type Region = LatLng & { latitudeDelta: number; longitudeDelta: number };

const PRIMARY = '#023665';

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

const Mapa = () => {
  const { user } = useAuth();
  const router = useRouter();
  const {
    itinerary, fetchItinerary,
    setHighlightedPlace,
    focusedMapPlaceIndex, setFocusedMapPlace,
  } = useItineraryStore();

  const [region, setRegion]     = useState<Region | undefined>(undefined);
  const [segments, setSegments] = useState<LatLng[][]>([]);
  const [points, setPoints]     = useState<any[]>([]);
  const mapRef        = useRef<MapView>(null);
  const isFocusingPin = useRef(false);
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Search & Filter ──────────────────────────────────
  const [search, setSearch]               = useState('');
  const [suggestions, setSuggestions]     = useState<Place[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSpot, setSelectedSpot]   = useState<Place | null>(null);
  const [categories, setCategories]       = useState<string[]>([]);
  const [showFilter, setShowFilter]       = useState(false);
  const [tempCategory, setTempCategory]   = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  // Carrega categorias ao montar
  useEffect(() => {
    placesService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    setSelectedSpot(null);
    if (!text.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await placesService.getAll(text, activeCategory || undefined);
        setSuggestions(results.slice(0, 8)); // máximo 8 sugestões
        setShowSuggestions(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  };

  const handleSelectSuggestion = (spot: Place) => {
    Keyboard.dismiss();
    setSearch(spot.name);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSpot(spot);
    mapRef.current?.animateToRegion({
      latitude: spot.latitude,
      longitude: spot.longitude,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    }, 600);
  };

  const handleClearSearch = () => {
    setSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSpot(null);
  };

  const handleApplyFilter = () => {
    setActiveCategory(tempCategory);
    setShowFilter(false);
    // Re-busca com novo filtro se há texto
    if (search.trim()) {
      placesService.getAll(search, tempCategory || undefined).then(r => {
        setSuggestions(r.slice(0, 8));
        setShowSuggestions(r.length > 0);
      });
    }
  };

  const handleClearFilter = () => {
    setTempCategory('');
    setActiveCategory('');
    setShowFilter(false);
  };
  // ──────────────────────────────────────────────────────

  useEffect(() => {
    const setup = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    };
    setup();
  }, []);

  useEffect(() => {
    if (!points.length) return;
    const timeout = setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        points.map(p => ({ latitude: p.latitude, longitude: p.longitude })),
        { edgePadding: { top: 120, bottom: 80, left: 80, right: 80 }, animated: true }
      );
    }, 400);
    return () => clearTimeout(timeout);
  }, [points]);

  useEffect(() => {
    if (!user?.id) return;
    if (!itinerary) fetchItinerary(user.id);
  }, [user, itinerary]);

  useEffect(() => {
    if (!itinerary?.places?.length) return;
    const sorted = [...itinerary.places].sort((a, b) => a.orderIndex - b.orderIndex);
    setPoints(sorted);
    buildSegments(sorted);
  }, [itinerary]);

  const buildSegments = async (sorted: any[]) => {
    if (!itinerary) return;
    if (sorted.length > 0) {
      setRegion(prev => ({
        ...(prev ?? { latitudeDelta: 0.06, longitudeDelta: 0.06 }),
        latitude: sorted[0].latitude,
        longitude: sorted[0].longitude,
      }));
    }
    const segmentPromises = sorted.slice(0, -1).map((place, i) =>
      RouteService.getRoute({
        origin: { lat: place.latitude, lng: place.longitude },
        destination: { lat: sorted[i + 1].latitude, lng: sorted[i + 1].longitude },
        waypoints: [],
      }).then(data => {
        const decoded = polyline.decode(data.geometry);
        return decoded.map(([lat, lng]: number[]) => ({ latitude: lat, longitude: lng }));
      }).catch(() => [
        { latitude: place.latitude, longitude: place.longitude },
        { latitude: sorted[i + 1].latitude, longitude: sorted[i + 1].longitude },
      ])
    );
    const results = await Promise.all(segmentPromises);
    setSegments(results);
  };

  useEffect(() => {
    if (!points.length || focusedMapPlaceIndex === null) return;
    const point = points[focusedMapPlaceIndex];
    isFocusingPin.current = true;
    setTimeout(() => {
      mapRef.current?.animateToRegion({
        latitude: point.latitude,
        longitude: point.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 600);
    }, 100);
    const timer = setTimeout(() => {
      setFocusedMapPlace(null);
      isFocusingPin.current = false;
    }, 1200);
    return () => clearTimeout(timer);
  }, [focusedMapPlaceIndex, points]);

  const handlePinPress = (index: number) => {
    setHighlightedPlace(index);
    router.navigate('../itinerario');
  };

  if (!itinerary) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🗺️</Text>
        <Text style={styles.emptyTitle}>Nenhum roteiro ainda</Text>
        <Text style={styles.emptyDesc}>Crie seu primeiro roteiro personalizado e comece a explorar o mundo.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        onPress={() => { setShowSuggestions(false); Keyboard.dismiss(); }}
      >
        {/* Rotas */}
        {segments.map((coords, i) => (
          <Polyline key={`seg-${i}`} coordinates={coords} strokeWidth={4} strokeColor={PLACE_COLORS[i % PLACE_COLORS.length]} />
        ))}

        {/* Ponto de origem */}
        {itinerary?.originLatitude != null && (
          <Marker coordinate={{ latitude: itinerary.originLatitude, longitude: itinerary.originLongitude }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.originWrapper}>
              <View style={styles.originDot} />
              <View style={styles.originLabel}><Text style={styles.originLabelText}>Início</Text></View>
            </View>
          </Marker>
        )}

        {/* Pins do roteiro */}
        {points.map((point, index) => {
          const color = PLACE_COLORS[index % PLACE_COLORS.length];
          return (
            <Marker key={`pin-${index}`} coordinate={{ latitude: point.latitude, longitude: point.longitude }} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
              <View style={styles.markerWrapper}>
                <TouchableOpacity style={[styles.label, { borderColor: color, backgroundColor: '#fff' }]} onPress={() => handlePinPress(index)} activeOpacity={0.75}>
                  <Text style={[styles.labelText, { color }]}>{index + 1}. {point.name.length > 14 ? point.name.slice(0, 14) + '…' : point.name}</Text>
                  <Text style={[styles.labelSub, { color }]}>ver no itinerário ↗</Text>
                </TouchableOpacity>
                <View style={styles.pinContainer}>
                  <MaterialIcons name="location-on" size={42} color={color} />
                  <View style={[styles.numberBadge, { backgroundColor: color }]}>
                    <Text style={styles.numberText}>{index + 1}</Text>
                  </View>
                </View>
              </View>
            </Marker>
          );
        })}

        {/* Pin do lugar selecionado pela busca */}
        {selectedSpot && (
          <Marker coordinate={{ latitude: selectedSpot.latitude, longitude: selectedSpot.longitude }} tracksViewChanges={false}>
            <View style={styles.searchPinWrapper}>
              <View style={styles.searchPin}>
                <Text style={styles.searchPinIcon}>{categoryIcon(selectedSpot.category)}</Text>
              </View>
              <View style={styles.searchPinTail} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* ─── Search Bar flutuante ─── */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          {searchLoading
            ? <ActivityIndicator size="small" color={PRIMARY} style={{ marginRight: 4 }} />
            : <Text style={styles.searchIcon}>🔍</Text>
          }
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ponto turístico..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
          {/* Botão filtro
          <TouchableOpacity
            style={[styles.filterBtn, activeCategory && styles.filterBtnActive]}
            onPress={() => { setTempCategory(activeCategory); setShowFilter(true); }}
            activeOpacity={0.8}
          >
            <Text style={styles.filterIcon}>⚙️</Text>
            {activeCategory ? <View style={styles.filterDot} /> : null}
          </TouchableOpacity>*/}
        </View>

        {/* Chip de filtro ativo */}
        {activeCategory ? (
          <View style={styles.activeChipRow}>
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>{activeCategory}</Text>
              <TouchableOpacity onPress={handleClearFilter}>
                <Text style={styles.activeChipClose}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Sugestões */}
        {showSuggestions && (
          <View style={styles.suggestions}>
            <FlatList
              data={suggestions}
              keyExtractor={(item, i) => `${item.name}-${i}`}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectSuggestion(item)} activeOpacity={0.7}>
                  <Text style={styles.suggestionEmoji}>{categoryIcon(item.category)}</Text>
                  <View style={styles.suggestionText}>
                    <Text style={styles.suggestionName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.suggestionCategory}>{item.category}</Text>
                  </View>
                  <Text style={styles.suggestionArrow}>↗</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* ─── Card de info do lugar selecionado ─── */}
      {selectedSpot && (
        <View style={styles.spotCard}>
          <View style={styles.spotCardHeader}>
            <Text style={styles.spotCardEmoji}>{categoryIcon(selectedSpot.category)}</Text>
            <View style={styles.spotCardInfo}>
              <Text style={styles.spotCardName} numberOfLines={1}>{selectedSpot.name}</Text>
              <Text style={styles.spotCardCategory}>{selectedSpot.category}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedSpot(null)} style={styles.spotCardClose}>
              <Text style={styles.spotCardCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedSpot.address ? (
            <Text style={styles.spotCardDetail}>📍 {selectedSpot.address}</Text>
          ) : null}
          {selectedSpot.openingHours ? (
            <Text style={styles.spotCardDetail}>🕐 {selectedSpot.openingHours}</Text>
          ) : null}
          {selectedSpot.fee ? (
            <Text style={styles.spotCardDetail}>💰 {selectedSpot.fee}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.spotCardBtn}
            onPress={() => router.push({ pathname: '/SpotDetailScreen', params: { spot: JSON.stringify(selectedSpot) } })}
            activeOpacity={0.85}
          >
            <Text style={styles.spotCardBtnText}>Ver detalhes</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Modal de Filtro ─── */}
    {/*  <Modal visible={showFilter} transparent animationType="slide" onRequestClose={() => setShowFilter(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilter(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Filtrar por categoria</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              <TouchableOpacity
                style={[styles.categoryItem, tempCategory === '' && styles.categoryItemSelected]}
                onPress={() => setTempCategory('')}
              >
                <Text style={[styles.categoryItemText, tempCategory === '' && styles.categoryItemTextSelected]}>
                  📍 Todas as categorias
                </Text>
                {tempCategory === '' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryItem, tempCategory === cat && styles.categoryItemSelected]}
                  onPress={() => setTempCategory(cat)}
                >
                  <Text style={[styles.categoryItemText, tempCategory === cat && styles.categoryItemTextSelected]}>
                    {categoryIcon(cat)} {cat}
                  </Text>
                  {tempCategory === cat && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearFilterBtn} onPress={handleClearFilter}>
                <Text style={styles.clearFilterBtnText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyFilter}>
                <Text style={styles.applyBtnText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>*/}
    </View>
  );
};

export default Mapa;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  // ─── Search ───────────────────────────────────────────
  searchWrapper: { position: 'absolute', top: 56, left: 16, right: 16, zIndex: 20 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 6, gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  clearBtn: { padding: 4 },
  clearBtnText: { fontSize: 14, color: '#9CA3AF', fontWeight: 'bold' },
  filterBtn: { padding: 6, borderRadius: 8, backgroundColor: '#F3F4F6' },
  filterBtnActive: { backgroundColor: '#EEF2FF' },
  filterIcon: { fontSize: 18 },
  filterDot: { position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: 4, backgroundColor: PRIMARY },

  activeChipRow: { flexDirection: 'row', marginTop: 6 },
  activeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF2FF', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: PRIMARY,
  },
  activeChipText: { fontSize: 13, color: PRIMARY, fontWeight: '600' },
  activeChipClose: { fontSize: 12, color: PRIMARY, fontWeight: 'bold' },

  suggestions: {
    backgroundColor: '#fff', borderRadius: 14, marginTop: 6,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 6, overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 10,
  },
  suggestionEmoji: { fontSize: 20 },
  suggestionText: { flex: 1 },
  suggestionName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  suggestionCategory: { fontSize: 12, color: '#6B7280', marginTop: 1, textTransform: 'capitalize' },
  suggestionArrow: { fontSize: 16, color: '#9CA3AF' },

  // ─── Pin de busca ─────────────────────────────────────
  searchPinWrapper: { alignItems: 'center' },
  searchPin: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', borderWidth: 2.5, borderColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
  },
  searchPinIcon: { fontSize: 22 },
  searchPinTail: { width: 3, height: 10, backgroundColor: PRIMARY, borderRadius: 2 },

  // ─── Card info ────────────────────────────────────────
  spotCard: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
    backgroundColor: '#fff', borderRadius: 20,
    padding: 18,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 }, elevation: 10,
  },
  spotCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  spotCardEmoji: { fontSize: 32 },
  spotCardInfo: { flex: 1 },
  spotCardName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  spotCardCategory: { fontSize: 12, color: PRIMARY, marginTop: 2, fontWeight: '500', textTransform: 'capitalize' },
  spotCardClose: { padding: 4 },
  spotCardCloseText: { fontSize: 16, color: '#9CA3AF', fontWeight: 'bold' },
  spotCardDetail: { fontSize: 13, color: '#4B5563', marginBottom: 4 },
  spotCardBtn: {
    marginTop: 12, backgroundColor: PRIMARY, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  spotCardBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // ─── Modal filtro ─────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  categoryItemSelected: { backgroundColor: '#F0F4FF', borderRadius: 8, paddingHorizontal: 8 },
  categoryItemText: { fontSize: 15, color: '#374151', textTransform: 'capitalize' },
  categoryItemTextSelected: { color: PRIMARY, fontWeight: '700' },
  checkmark: { color: PRIMARY, fontSize: 16, fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  clearFilterBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 14, alignItems: 'center' },
  clearFilterBtnText: { color: '#6B7280', fontWeight: '600', fontSize: 15 },
  applyBtn: { flex: 2, backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // ─── Itinerário ───────────────────────────────────────
  originWrapper: { alignItems: 'center', gap: 4 },
  originDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: PRIMARY, borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  originLabel: { backgroundColor: PRIMARY, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  originLabelText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  markerWrapper: { alignItems: 'center' },
  label: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4, maxWidth: 160 },
  labelText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  labelSub: { fontSize: 10, fontWeight: '500', textAlign: 'center', opacity: 0.8, marginTop: 1 },
  pinContainer: { alignItems: 'center', justifyContent: 'center', width: 42, height: 42 },
  numberBadge: { position: 'absolute', top: 5, width: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' },
  numberText: { color: '#fff', fontWeight: 'bold', fontSize: 10 },

  // ─── Empty ────────────────────────────────────────────
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 32, backgroundColor: '#f9f9f9' },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
  emptyDesc: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 22 },
});