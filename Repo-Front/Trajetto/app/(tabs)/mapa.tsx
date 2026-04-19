import { PLACE_COLORS } from '@/constants/placeColors';
import { useAuth } from '@/context/AuthContext';
import { useItineraryStore } from '@/hooks/itineraryStore';
import { RouteService } from '@/services/routeService';
import { MaterialIcons } from '@expo/vector-icons';
import polyline from '@mapbox/polyline';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

type LatLng = { latitude: number; longitude: number };
type Region = LatLng & { latitudeDelta: number; longitudeDelta: number };

const Mapa = () => {
    const { user } = useAuth();
    const router = useRouter();
    const { itinerary, fetchItinerary, setHighlightedPlace, focusedMapPlaceIndex, setFocusedMapPlace } = useItineraryStore();
    const [region, setRegion] = useState<Region | undefined>(undefined);
    const [segments, setSegments] = useState<LatLng[][]>([]);
    const [points, setPoints] = useState<any[]>([]);
    const mapRef = useRef<MapView>(null);
    const hasInitialized = useRef(false);
    const isFocusingPin = useRef(false);

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
      points.map(p => ({
        latitude: p.latitude,
        longitude: p.longitude,
      })),
      {
        edgePadding: { top: 80, bottom: 80, left: 80, right: 80 },
        animated: true,
      }
    );
  }, 400);

  return () => clearTimeout(timeout);
}, [points]);

    // Fetch itinerary if not already loaded in store
    useEffect(() => {
        if (!user?.id) return;

        if (!itinerary) {
            fetchItinerary(user.id);
        }
    }, [user, itinerary]);


    useEffect(() => {
        if (!itinerary?.places?.length) return;

        const sorted = [...itinerary.places].sort(
            (a, b) => a.orderIndex - b.orderIndex
        );

        setPoints(sorted);

        const setup = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
        };

        setup();
        buildSegments(sorted);
    }, [itinerary]);

    const buildSegments = async (sorted: any[]) => {
        if (!itinerary) return;

        // Center map on first point
        if (sorted.length > 0) {
            setRegion(prev => ({
                ...(prev ?? { latitudeDelta: 0.06, longitudeDelta: 0.06 }),
                latitude: sorted[0].latitude,
                longitude: sorted[0].longitude,
            }));
        }

        // Fetch each segment independently for individual coloring
        const segmentPromises = sorted.slice(0, -1).map((place, i) =>
            RouteService.getRoute({
                origin: { lat: place.latitude, lng: place.longitude },
                destination: { lat: sorted[i + 1].latitude, lng: sorted[i + 1].longitude },
                waypoints: [],
            }).then(data => {
                const decoded = polyline.decode(data.geometry);
                return decoded.map(([lat, lng]: number[]) => ({ latitude: lat, longitude: lng }));
            }).catch(() => [
                // Fallback: straight line if route API fails
                { latitude: place.latitude, longitude: place.longitude },
                { latitude: sorted[i + 1].latitude, longitude: sorted[i + 1].longitude },
            ])
        );

        const results = await Promise.all(segmentPromises);
        setSegments(results);
    };

    // Animate map to pin when coming from itinerary tab
    useEffect(() => {
        if (!points.length) return;

        // 👉 Se veio de clique em pin
        if (focusedMapPlaceIndex !== null) {
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
        }


    }, [focusedMapPlaceIndex, points]);

    const handlePinPress = (index: number) => {
        setHighlightedPlace(index);
        router.navigate('../itinerario');
    };

    return (
        itinerary ? (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region}
                showsUserLocation
            >
                {/* Segmento colorido por trecho */}
                {segments.map((coords, i) => (
                    <Polyline
                        key={`seg-${i}`}
                        coordinates={coords}
                        strokeWidth={4}
                        strokeColor={PLACE_COLORS[i % PLACE_COLORS.length]}
                    />
                ))}

                {/* Marco zero — ponto de partida escolhido pelo usuário */}
                {itinerary?.originLatitude != null && itinerary?.originLongitude != null && (
                    <Marker
                        coordinate={{ latitude: itinerary.originLatitude, longitude: itinerary.originLongitude }}
                        anchor={{ x: 0.5, y: 0.5 }}
                        tracksViewChanges={false}
                    >
                        <View style={styles.originWrapper}>
                            <View style={styles.originDot} />
                            <View style={styles.originLabel}>
                                <Text style={styles.originLabelText}>Início</Text>
                            </View>
                        </View>
                    </Marker>
                )}

                {/* Pins com label clicável */}
                {points.map((point, index) => {
                    const color = PLACE_COLORS[index % PLACE_COLORS.length];
                    return (
                        <Marker
                            key={`pin-${index}`}
                            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                            anchor={{ x: 0.5, y: 1 }}
                            tracksViewChanges={false}
                        >
                            <View style={styles.markerWrapper}>
                                {/* Label clicável acima do pin */}
                                <TouchableOpacity
                                    style={[styles.label, { borderColor: color, backgroundColor: '#fff' }]}
                                    onPress={() => handlePinPress(index)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={[styles.labelText, { color }]}>
                                        {index + 1}. {point.name.length > 14 ? point.name.slice(0, 14) + '…' : point.name}
                                    </Text>
                                    <Text style={[styles.labelSub, { color }]}>ver no itinerário ↗</Text>
                                </TouchableOpacity>

                                {/* Pin com ícone e número */}
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
            </MapView>
        </View>
        ) : (
            <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>🗺️</Text>
                        <Text style={styles.emptyTitle}>Nenhum roteiro ainda</Text>
                        <Text style={styles.emptyDesc}>
                          Crie seu primeiro roteiro personalizado e comece a explorar o mundo.
                        </Text>
                      </View>
        )
    );
};

export default Mapa;

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        elevation: 5,
    },
    backText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#023665',
    },
    container: { flex: 1 },
    map: { flex: 1 },

    originWrapper: {
        alignItems: 'center',
        gap: 4,
    },
    originDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#023665',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    originLabel: {
        backgroundColor: '#023665',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    originLabelText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    markerWrapper: {
        alignItems: 'center',
    },
    label: {
        borderWidth: 1.5,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 4,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
        maxWidth: 160,
    },
    labelText: {
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
    },
    labelSub: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
        opacity: 0.8,
        marginTop: 1,
    },

    pinContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 42,
        height: 42,
    },
    numberBadge: {
        position: 'absolute',
        top: 5,
        width: 17,
        height: 17,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    numberText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 10,
    },
      emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    backgroundColor: '#f9f9f9',
    flex: 1,
    justifyContent: 'center',
  },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
  emptyDesc: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 22 },

});
