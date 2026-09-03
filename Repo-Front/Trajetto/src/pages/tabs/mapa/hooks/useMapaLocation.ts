import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming, cancelAnimation } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { useItineraryStore } from '@/hooks/itineraryStore';
import { RouteService } from '@/services';
import { isPlacePast } from '@/app/utils/isPlacePast';
import { LatLng, Region } from '../mapaFormat';

export function useMapaLocation() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    itinerary, fetchItinerary,
    setHighlightedPlace,
    focusedMapPlaceIndex, setFocusedMapPlace,
  } = useItineraryStore();

  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [segments, setSegments] = useState<LatLng[][]>([]);
  const [points, setPoints] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const mapRef = useRef<MapView>(null);
  const isFocusingPin = useRef(false);

  const pulseAnim = useSharedValue(0);
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseAnim.value,
    transform: [{ scale: 1 + pulseAnim.value * 0.6 }],
  }));

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
        points.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
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
        setRegion((prev) => ({
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
            .then((data) => polyline.decode(data.geometry).map(([lat, lng]: number[]) => ({ latitude: lat, longitude: lng })))
            .catch(() => [{ latitude: orig.lat, longitude: orig.lng }, { latitude: dest.lat, longitude: dest.lng }])
        )
      );

      if (!cancelled) setSegments(result);
    })();

    return () => { cancelled = true; };
  }, [itinerary]);

  const sorted = itinerary?.places
    ? [...itinerary.places].sort((a, b) => a.orderIndex - b.orderIndex)
    : [];
  const firstUpcomingIdx = itinerary
    ? sorted.findIndex((p) => !isPlacePast(itinerary.startDate, p.estimatedVisitTime))
    : 0;
  const hasOriginSeg = itinerary?.originLatitude != null;
  const currentSegIdx = hasOriginSeg
    ? (firstUpcomingIdx >= 0 ? firstUpcomingIdx : -1)
    : (firstUpcomingIdx > 0 ? firstUpcomingIdx - 1 : -1);
  const currentSegCoords = currentSegIdx >= 0 ? (segments[currentSegIdx] ?? []) : [];

  useEffect(() => {
    pulseAnim.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    return () => cancelAnimation(pulseAnim);
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

  return {
    itinerary,
    region,
    segments,
    points,
    userLocation,
    mapRef,
    pulseStyle,
    sorted,
    firstUpcomingIdx,
    hasOriginSeg,
    currentSegIdx,
    currentSegCoords,
    handlePinPress,
  };
}
