import { PLACE_COLORS } from '@/constants/placeColors';
import { useAuth } from '@/context/AuthContext';
import { useItineraryStore } from '@/hooks/itineraryStore';
import { RouteService } from '@/services/routeService';
import { placesService, Place, PlacesFilter } from '@/services/placesService';
import { isPlacePast } from '@/app/utils/isPlacePast';
import { MaterialIcons } from '@expo/vector-icons';
import polyline from '@mapbox/polyline';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet, Text, TextInput, TouchableOpacity,
  View, FlatList, Keyboard, Modal, ScrollView,
  ActivityIndicator, Switch, Animated,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

type LatLng = { latitude: number; longitude: number };
type Region = LatLng & { latitudeDelta: number; longitudeDelta: number };

const PRIMARY = '#023665';

// Haversine no frontend para mostrar distância no card
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

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatWalkTime(meters: number): string {
  const minutes = Math.round(meters / 80); // ~80m/min caminhando
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
}

function formatCarTime(meters: number): string {
  const minutes = Math.round(meters / 500); // ~500m/min de carro urbano
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
}

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

// Conta filtros ativos
function countActiveFilters(f: PlacesFilter): number {
  let n = 0;
  if (f.category)   n++;
  if (f.fee)        n++;
  if (f.hasHours)   n++;
  if (f.profile)    n++;
  if (f.maxDistance) n++;
  return n;
}

// Interpola uma coordenada ao longo de um caminho (t = 0..1)
function interpolateAlongPath(coords: LatLng[], t: number): LatLng {
  if (coords.length === 0) return { latitude: 0, longitude: 0 };
  if (coords.length === 1) return coords[0];
  const total = coords.length - 1;
  const pos = t * total;
  const i = Math.min(Math.floor(pos), total - 1);
  const f = pos - i;
  return {
    latitude: coords[i].latitude + (coords[i + 1].latitude - coords[i].latitude) * f,
    longitude: coords[i].longitude + (coords[i + 1].longitude - coords[i].longitude) * f,
  };
}

// Polyline pontilhada animada — setInterval contínuo (sem reset de loop = sem salto visual)
function AnimatedDashedPolyline({ coordinates, color, zIndex }: { coordinates: LatLng[]; color: string; zIndex: number }) {
  const [dashPhase, setDashPhase] = useState(0);
  useEffect(() => {
    // Decrementa indefinidamente — lineDashPhase é periódico, não precisa resetar
    const id = setInterval(() => setDashPhase(p => p - 0.5), 20);
    return () => clearInterval(id);
  }, []);
  return (
    <Polyline
      coordinates={coordinates}
      strokeWidth={3}
      strokeColor={color}
      lineDashPattern={[5, 16]}
      lineDashPhase={dashPhase}
      zIndex={zIndex}
    />
  );
}

// Rumo em graus entre dois pontos (para rotacionar a seta)
function bearing(from: LatLng, to: LatLng): number {
  const dLon = (to.longitude - from.longitude) * Math.PI / 180;
  const lat1 = from.latitude * Math.PI / 180;
  const lat2 = to.latitude * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

const DISTANCE_OPTIONS = [
  { label: 'Qualquer', value: undefined },
  { label: '500 m',   value: 500 },
  { label: '1 km',    value: 1000 },
  { label: '2 km',    value: 2000 },
  { label: '5 km',    value: 5000 },
];

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
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const mapRef        = useRef<MapView>(null);
  const isFocusingPin = useRef(false);
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animações do mapa
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // ─── Search ───────────────────────────────────────────
  const [search, setSearch]           = useState('');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading]     = useState(false);
  const [selectedSpot, setSelectedSpot]       = useState<Place | null>(null);

  // ─── Filtros ──────────────────────────────────────────
  const [showFilter, setShowFilter]   = useState(false);
  const [categories, setCategories]   = useState<string[]>([]);
  const [profiles, setProfiles]       = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<PlacesFilter>({});
  // Temp (dentro do modal antes de aplicar)
  const [tempCategory,    setTempCategory]    = useState('');
  const [tempFee,         setTempFee]         = useState<'yes' | 'no' | ''>('');
  const [tempHasHours,    setTempHasHours]    = useState(false);
  const [tempProfile,     setTempProfile]     = useState('');
  const [tempMaxDistance, setTempMaxDistance] = useState<number | undefined>(undefined);

  const activeCount = countActiveFilters(activeFilter);

  useEffect(() => {
    placesService.getCategories().then(setCategories).catch(() => {});
    placesService.getProfiles().then(setProfiles).catch(() => {});
  }, []);

  // ─── Busca com debounce ───────────────────────────────
  const doSearch = async (text: string, filter: PlacesFilter) => {
    if (!text.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    setSearchLoading(true);
    try {
      const results = await placesService.getAll({
        search: text,
        ...filter,
        lat: filter.maxDistance ? userLocation?.latitude : undefined,
        lng: filter.maxDistance ? userLocation?.longitude : undefined,
      });
      setSuggestions(results.slice(0, 8));
      setShowSuggestions(results.length > 0);
    } catch { setSuggestions([]); }
    finally { setSearchLoading(false); }
  };

  const handleSearchChange = (text: string) => {
    setSearch(text);
    setSelectedSpot(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(text, activeFilter), 350);
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

  // ─── Filtros ──────────────────────────────────────────
  const openFilter = () => {
    setTempCategory(activeFilter.category || '');
    setTempFee((activeFilter.fee as any) || '');
    setTempHasHours(activeFilter.hasHours || false);
    setTempProfile(activeFilter.profile || '');
    setTempMaxDistance(activeFilter.maxDistance);
    setShowFilter(true);
  };

  const handleApplyFilter = () => {
    const newFilter: PlacesFilter = {
      category:    tempCategory || undefined,
      fee:         tempFee || undefined,
      hasHours:    tempHasHours || undefined,
      profile:     tempProfile || undefined,
      maxDistance: tempMaxDistance,
    };
    setActiveFilter(newFilter);
    setShowFilter(false);
    if (search.trim()) doSearch(search, newFilter);
  };

  const handleClearAllFilters = () => {
    setTempCategory('');
    setTempFee('');
    setTempHasHours(false);
    setTempProfile('');
    setTempMaxDistance(undefined);
    setActiveFilter({});
    setShowFilter(false);
    if (search.trim()) doSearch(search, {});
  };

  // ─── Location & mapa ─────────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
    })();
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

    let cancelled = false;

    (async () => {
      if (sorted.length > 0) {
        setRegion(prev => ({
          ...(prev ?? { latitudeDelta: 0.06, longitudeDelta: 0.06 }),
          latitude: sorted[0].latitude,
          longitude: sorted[0].longitude,
        }));
      }

      const pairs: Array<[{ lat: number; lng: number }, { lat: number; lng: number }]> = [];
      if (itinerary.originLatitude != null) {
        pairs.push([
          { lat: itinerary.originLatitude, lng: itinerary.originLongitude! },
          { lat: sorted[0].latitude, lng: sorted[0].longitude },
        ]);
      }
      sorted.slice(0, -1).forEach((place: any, i: number) => {
        pairs.push([
          { lat: place.latitude, lng: place.longitude },
          { lat: sorted[i + 1].latitude, lng: sorted[i + 1].longitude },
        ]);
      });

      const result = await Promise.all(
        pairs.map(([orig, dest]) =>
          RouteService.getRoute({ origin: orig, destination: dest, waypoints: [] })
            .then(data => polyline.decode(data.geometry).map(([lat, lng]: number[]) => ({ latitude: lat, longitude: lng })))
            .catch(() => [{ latitude: orig.lat, longitude: orig.lng }, { latitude: dest.lat, longitude: dest.lng }])
        )
      );

      if (!cancelled) setSegments(result);
    })();

    return () => { cancelled = true; };
  }, [itinerary]);

  // Calcula índice do próximo lugar a visitar
  const sorted = itinerary?.places
    ? [...itinerary.places].sort((a, b) => a.orderIndex - b.orderIndex)
    : [];
  const firstUpcomingIdx = itinerary
    ? sorted.findIndex(p => !isPlacePast(itinerary.startDate, p.estimatedVisitTime))
    : 0;
  const hasOriginSeg = itinerary?.originLatitude != null;
  const currentSegIdx = hasOriginSeg
    ? (firstUpcomingIdx >= 0 ? firstUpcomingIdx : -1)
    : (firstUpcomingIdx > 0 ? firstUpcomingIdx - 1 : -1);
  const currentSegCoords = currentSegIdx >= 0 ? (segments[currentSegIdx] ?? []) : [];

  // Pulso no próximo destino
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  useEffect(() => {
    if (!points.length || focusedMapPlaceIndex === null) return;
    const point = points[focusedMapPlaceIndex];
    isFocusingPin.current = true;
    setTimeout(() => {
      mapRef.current?.animateToRegion({ latitude: point.latitude, longitude: point.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 600);
    }, 100);
    const timer = setTimeout(() => { setFocusedMapPlace(null); isFocusingPin.current = false; }, 1200);
    return () => clearTimeout(timer);
  }, [focusedMapPlaceIndex, points]);

  const handlePinPress = (index: number) => {
    setHighlightedPlace(index);
    router.navigate('../itinerario');
  };

  // Distância do usuário até o spot selecionado
  const spotDistance = selectedSpot && userLocation
    ? haversineMeters(userLocation.latitude, userLocation.longitude, selectedSpot.latitude, selectedSpot.longitude)
    : null;

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
        {/* Um único map — cada segmento renderiza exatamente UM tipo */}
        {segments.map((coords, i) => {
          const destColor = PLACE_COLORS[(hasOriginSeg ? i : i + 1) % PLACE_COLORS.length];
          if (i < currentSegIdx) {
            // Passado — cinza desbotado
            return (
              <Polyline key={`seg-${i}`} coordinates={coords} strokeWidth={1.5} strokeColor="rgba(160,168,180,0.22)" zIndex={1} />
            );
          }
          if (i === currentSegIdx) {
            // Atual — SOMENTE pontilhado animado, sem sólido
            return (
              <AnimatedDashedPolyline
                key={`seg-${i}`}
                coordinates={coords}
                color={PLACE_COLORS[firstUpcomingIdx % PLACE_COLORS.length]}
                zIndex={100}
              />
            );
          }
          // Futuro — sólido colorido
          return (
            <Polyline key={`seg-${i}`} coordinates={coords} strokeWidth={3} strokeColor={destColor} zIndex={10} />
          );
        })}

        {/* Setas de direção nos segmentos futuros */}
        {segments.map((coords, i) => {
          if (i <= currentSegIdx || coords.length < 2) return null;
          const mid      = interpolateAlongPath(coords, 0.5);
          const endCoord = coords[coords.length - 1];
          const rot      = bearing(mid, endCoord);
          const color = PLACE_COLORS[(hasOriginSeg ? i : i + 1) % PLACE_COLORS.length];
          return (
            <Marker key={`arrow-${i}`} coordinate={mid} anchor={{ x: 0.5, y: 0.5 }} rotation={rot} tracksViewChanges={false}>
              <View style={[mapStyles.arrowMarker, { borderColor: color }]}>
                <Text style={[mapStyles.arrowText, { color }]}>▶</Text>
              </View>
            </Marker>
          );
        })}


        {itinerary?.originLatitude != null && (
          <Marker coordinate={{ latitude: itinerary.originLatitude, longitude: itinerary.originLongitude }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.originWrapper}>
              <View style={styles.originDot} />
              <View style={styles.originLabel}><Text style={styles.originLabelText}>Início</Text></View>
            </View>
          </Marker>
        )}

        {points.map((point, index) => {
          const isPast    = isPlacePast(itinerary!.startDate, point.estimatedVisitTime);
          const isNext    = index === firstUpcomingIdx;
          const color     = isPast ? '#9aa4b2' : PLACE_COLORS[index % PLACE_COLORS.length];
          return (
            <Marker key={`pin-${index}`} coordinate={{ latitude: point.latitude, longitude: point.longitude }} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={isNext}>
              <View style={styles.markerWrapper}>
                {/* Pulso no próximo destino */}
                {isNext && (
                  <Animated.View style={[
                    mapStyles.pulse,
                    { borderColor: color, opacity: pulseAnim, transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }] }
                  ]} />
                )}
                <TouchableOpacity
                  style={[styles.label, { borderColor: isPast ? '#c8ced8' : color, backgroundColor: isPast ? '#f0f2f5' : '#fff', opacity: isPast ? 0.6 : 1 }]}
                  onPress={() => handlePinPress(index)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.labelText, { color }]}>{index + 1}. {point.name.length > 14 ? point.name.slice(0, 14) + '…' : point.name}</Text>
                  <Text style={[styles.labelSub, { color }]}>{isPast ? 'visitado ✓' : 'ver no itinerário ↗'}</Text>
                </TouchableOpacity>
                <View style={[styles.pinContainer, isPast && { opacity: 0.45 }]}>
                  <MaterialIcons name="location-on" size={42} color={color} />
                  <View style={[styles.numberBadge, { backgroundColor: color }]}>
                    <Text style={styles.numberText}>{index + 1}</Text>
                  </View>
                </View>
              </View>
            </Marker>
          );
        })}

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

      {/* ─── Search Bar ─── */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          {searchLoading
            ? <ActivityIndicator size="small" color={PRIMARY} />
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
          <TouchableOpacity style={[styles.filterBtn, activeCount > 0 && styles.filterBtnActive]} onPress={openFilter} activeOpacity={0.8}>
            <Text style={styles.filterIcon}>⚙️</Text>
            {activeCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Barra de trajeto atual */}
        {currentSegIdx >= 0 && firstUpcomingIdx < points.length && (
          <View style={mapStyles.routeBar}>
            <View style={[mapStyles.routeDot, { backgroundColor: PLACE_COLORS[firstUpcomingIdx % PLACE_COLORS.length] }]} />
            <Text style={mapStyles.routeText} numberOfLines={1}>
              <Text style={[mapStyles.routeLabel, { color: PLACE_COLORS[firstUpcomingIdx % PLACE_COLORS.length] }]}>Agora · </Text>
              {hasOriginSeg && firstUpcomingIdx === 0
                ? <Text style={[mapStyles.routeNum, { color: PRIMARY }]}>Início</Text>
                : <Text style={[mapStyles.routeNum, { color: PLACE_COLORS[(firstUpcomingIdx - 1 + PLACE_COLORS.length) % PLACE_COLORS.length] }]}>{firstUpcomingIdx}</Text>
              }
              <Text style={mapStyles.routeArrow}> → </Text>
              <Text style={[mapStyles.routeNum, { color: PLACE_COLORS[firstUpcomingIdx % PLACE_COLORS.length] }]}>{firstUpcomingIdx + 1}</Text>
              {'  '}{points[firstUpcomingIdx]?.name?.length > 16
                ? points[firstUpcomingIdx].name.slice(0, 16) + '…'
                : points[firstUpcomingIdx]?.name}
            </Text>
          </View>
        )}

        {/* Chips de filtros ativos */}
        {activeCount > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} keyboardShouldPersistTaps="handled">
            {activeFilter.category && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>📍 {activeFilter.category}</Text>
                <TouchableOpacity onPress={() => { const f = { ...activeFilter, category: undefined }; setActiveFilter(f); if (search.trim()) doSearch(search, f); }}>
                  <Text style={styles.chipClose}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {activeFilter.fee && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{activeFilter.fee === 'no' ? '🆓 Gratuito' : '💰 Pago'}</Text>
                <TouchableOpacity onPress={() => { const f = { ...activeFilter, fee: undefined }; setActiveFilter(f); if (search.trim()) doSearch(search, f); }}>
                  <Text style={styles.chipClose}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {activeFilter.hasHours && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>🕐 Com horário</Text>
                <TouchableOpacity onPress={() => { const f = { ...activeFilter, hasHours: undefined }; setActiveFilter(f); if (search.trim()) doSearch(search, f); }}>
                  <Text style={styles.chipClose}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {activeFilter.profile && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>👤 {activeFilter.profile}</Text>
                <TouchableOpacity onPress={() => { const f = { ...activeFilter, profile: undefined }; setActiveFilter(f); if (search.trim()) doSearch(search, f); }}>
                  <Text style={styles.chipClose}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {activeFilter.maxDistance && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>📏 {formatDistance(activeFilter.maxDistance)}</Text>
                <TouchableOpacity onPress={() => { const f = { ...activeFilter, maxDistance: undefined }; setActiveFilter(f); if (search.trim()) doSearch(search, f); }}>
                  <Text style={styles.chipClose}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

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
                    <Text style={styles.suggestionCategory}>{item.category}{item.fee === 'no' ? ' · 🆓' : item.fee === 'yes' ? ' · 💰' : ''}</Text>
                  </View>
                  <Text style={styles.suggestionArrow}>↗</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* ─── Card do spot selecionado ─── */}
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

          {/* Infos */}
          <View style={styles.spotCardMeta}>
            {selectedSpot.fee === 'no' && <View style={styles.badge}><Text style={styles.badgeText}>🆓 Gratuito</Text></View>}
            {selectedSpot.fee === 'yes' && <View style={[styles.badge, styles.badgePaid]}><Text style={styles.badgeText}>💰 Pago</Text></View>}
            {selectedSpot.openingHours ? <View style={styles.badge}><Text style={styles.badgeText}>🕐 {selectedSpot.openingHours}</Text></View> : null}
          </View>

          {selectedSpot.address ? <Text style={styles.spotCardDetail}>📍 {selectedSpot.address}</Text> : null}

          {/* Distância e tempo */}
          {spotDistance !== null && (
            <View style={styles.distanceRow}>
              <View style={styles.distanceCard}>
                <Text style={styles.distanceIcon}>🚶</Text>
                <Text style={styles.distanceValue}>{formatWalkTime(spotDistance)}</Text>
                <Text style={styles.distanceLabel}>a pé</Text>
              </View>
              <View style={styles.distanceDivider} />
              <View style={styles.distanceCard}>
                <Text style={styles.distanceIcon}>🚗</Text>
                <Text style={styles.distanceValue}>{formatCarTime(spotDistance)}</Text>
                <Text style={styles.distanceLabel}>de carro</Text>
              </View>
              <View style={styles.distanceDivider} />
              <View style={styles.distanceCard}>
                <Text style={styles.distanceIcon}>📏</Text>
                <Text style={styles.distanceValue}>{formatDistance(spotDistance)}</Text>
                <Text style={styles.distanceLabel}>daqui</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.spotCardBtn}
            onPress={() => router.push({ pathname: '/SpotDetailScreen', params: { spot: JSON.stringify(selectedSpot) } })}
            activeOpacity={0.85}
          >
            <Text style={styles.spotCardBtnText}>Ver detalhes completos →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Modal de Filtros ─── */}
      <Modal visible={showFilter} transparent animationType="slide" onRequestClose={() => setShowFilter(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilter(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <Text style={styles.modalTitle}>Filtros</Text>
              {activeCount > 0 && (
                <TouchableOpacity onPress={handleClearAllFilters}>
                  <Text style={styles.modalClearAll}>Limpar tudo</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>

              {/* Categoria */}
              <Text style={styles.filterSection}>Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {['', ...categories].map(cat => (
                  <TouchableOpacity
                    key={cat || 'all'}
                    style={[styles.filterChip, tempCategory === cat && styles.filterChipActive]}
                    onPress={() => setTempCategory(cat)}
                  >
                    <Text style={[styles.filterChipText, tempCategory === cat && styles.filterChipTextActive]}>
                      {cat ? `${categoryIcon(cat)} ${cat}` : '📍 Todas'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Entrada */}
              <Text style={styles.filterSection}>Entrada</Text>
              <View style={styles.filterRow}>
                {[
                  { label: 'Qualquer', value: '' },
                  { label: '🆓 Gratuito', value: 'no' },
                  { label: '💰 Pago', value: 'yes' },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.filterOption, tempFee === opt.value && styles.filterOptionActive]}
                    onPress={() => setTempFee(opt.value as any)}
                  >
                    <Text style={[styles.filterOptionText, tempFee === opt.value && styles.filterOptionTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Horário */}
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.filterSection}>Apenas com horário definido</Text>
                  <Text style={styles.filterSubLabel}>Exclui locais sem informação de horário</Text>
                </View>
                <Switch
                  value={tempHasHours}
                  onValueChange={setTempHasHours}
                  trackColor={{ false: '#E5E7EB', true: PRIMARY }}
                  thumbColor="#fff"
                />
              </View>

              {/* Perfil de viajante */}
              <Text style={styles.filterSection}>Perfil de viajante</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {['', ...profiles].map(p => (
                  <TouchableOpacity
                    key={p || 'all'}
                    style={[styles.filterChip, tempProfile === p && styles.filterChipActive]}
                    onPress={() => setTempProfile(p)}
                  >
                    <Text style={[styles.filterChipText, tempProfile === p && styles.filterChipTextActive]}>
                      {p || '👤 Todos'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Distância máxima */}
              <Text style={styles.filterSection}>Distância máxima da sua localização</Text>
              <View style={styles.filterRow}>
                {DISTANCE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={String(opt.value)}
                    style={[styles.filterOption, tempMaxDistance === opt.value && styles.filterOptionActive]}
                    onPress={() => setTempMaxDistance(opt.value)}
                  >
                    <Text style={[styles.filterOptionText, tempMaxDistance === opt.value && styles.filterOptionTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearFilterBtn} onPress={() => setShowFilter(false)}>
                <Text style={styles.clearFilterBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyFilter}>
                <Text style={styles.applyBtnText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Mapa;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  // Search
  searchWrapper: { position: 'absolute', top: 56, left: 16, right: 16, zIndex: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  clearBtn: { padding: 4 },
  clearBtnText: { fontSize: 14, color: '#9CA3AF', fontWeight: 'bold' },
  filterBtn: { padding: 6, borderRadius: 8, backgroundColor: '#F3F4F6' },
  filterBtnActive: { backgroundColor: '#EEF2FF' },
  filterIcon: { fontSize: 18 },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: PRIMARY, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  chipsRow: { marginTop: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: PRIMARY, marginRight: 6 },
  chipText: { fontSize: 12, color: PRIMARY, fontWeight: '600' },
  chipClose: { fontSize: 11, color: PRIMARY, fontWeight: 'bold' },

  suggestions: { backgroundColor: '#fff', borderRadius: 14, marginTop: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6, overflow: 'hidden' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 10 },
  suggestionEmoji: { fontSize: 20 },
  suggestionText: { flex: 1 },
  suggestionName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  suggestionCategory: { fontSize: 12, color: '#6B7280', marginTop: 1, textTransform: 'capitalize' },
  suggestionArrow: { fontSize: 16, color: '#9CA3AF' },

  // Pin busca
  searchPinWrapper: { alignItems: 'center' },
  searchPin: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', borderWidth: 2.5, borderColor: PRIMARY, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, elevation: 6 },
  searchPinIcon: { fontSize: 22 },
  searchPinTail: { width: 3, height: 10, backgroundColor: PRIMARY, borderRadius: 2 },

  // Card spot
  spotCard: { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: '#fff', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: -3 }, elevation: 10 },
  spotCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  spotCardEmoji: { fontSize: 32 },
  spotCardInfo: { flex: 1 },
  spotCardName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  spotCardCategory: { fontSize: 12, color: PRIMARY, marginTop: 2, fontWeight: '500', textTransform: 'capitalize' },
  spotCardClose: { padding: 4 },
  spotCardCloseText: { fontSize: 16, color: '#9CA3AF', fontWeight: 'bold' },
  spotCardMeta: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  badge: { backgroundColor: '#F0FDF4', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgePaid: { backgroundColor: '#FFF7ED' },
  badgeText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  spotCardDetail: { fontSize: 13, color: '#4B5563', marginBottom: 4 },

  distanceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginVertical: 10 },
  distanceCard: { flex: 1, alignItems: 'center', gap: 2 },
  distanceIcon: { fontSize: 20 },
  distanceValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  distanceLabel: { fontSize: 11, color: '#6B7280' },
  distanceDivider: { width: 1, height: 36, backgroundColor: '#E5E7EB' },

  spotCardBtn: { backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  spotCardBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Modal filtros
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  modalTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalClearAll: { fontSize: 14, color: '#EF4444', fontWeight: '600' },
  filterSection: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterSubLabel: { fontSize: 12, color: '#6B7280', marginTop: -8, marginBottom: 8 },

  filterChip: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, backgroundColor: '#fff' },
  filterChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  filterChipText: { fontSize: 13, color: '#374151', textTransform: 'capitalize' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },

  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  filterOption: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff' },
  filterOptionActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  filterOptionText: { fontSize: 13, color: '#374151' },
  filterOptionTextActive: { color: '#fff', fontWeight: '600' },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },

  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  clearFilterBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 14, alignItems: 'center' },
  clearFilterBtnText: { color: '#6B7280', fontWeight: '600', fontSize: 15 },
  applyBtn: { flex: 2, backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Itinerário
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

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 32, backgroundColor: '#f9f9f9' },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
  emptyDesc: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 22 },
});

const mapStyles = StyleSheet.create({
  routeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
    gap: 7,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  routeDot: { width: 8, height: 8, borderRadius: 4 },
  routeText: { fontSize: 12, color: '#1a1a1a', flexShrink: 1 },
  routeLabel: { fontSize: 11, color: '#8a9ab0', fontWeight: '500' },
  routeNum: { fontSize: 12, fontWeight: '700' },
  routeArrow: { fontSize: 11, color: '#8a9ab0' },
  arrowMarker: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  arrowText: { fontSize: 9, fontWeight: 'bold' },
  pulse: {
    position: 'absolute',
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2.5,
    bottom: 32, alignSelf: 'center',
    zIndex: -1,
  },
});