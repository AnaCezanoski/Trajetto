import { useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { Place } from '@/services';
import { showAlert } from '@/src/components/alerts/alertService';
import { haversineMeters, parseOpeningHours, wheelchairLabel } from '../spotFormat';

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type SpotDetailData = {
  spot: Place;
  distance: number | null;
  region: Region;
  hours: { period: string; hours: string }[];
  wc: string | null;
  openMaps: () => void;
  openWebsite: () => void;
  callPhone: () => void;
  openWikipedia: () => void;
};

export function useSpotDetail(): SpotDetailData {
  const params = useLocalSearchParams<{ spot: string }>();
  const spot = useMemo(() => JSON.parse(params.spot) as Place, [params.spot]);

  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setDistance(haversineMeters(loc.coords.latitude, loc.coords.longitude, spot.latitude, spot.longitude));
    })();
  }, [spot.latitude, spot.longitude]);

  const openMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`;
    Linking.openURL(url).catch(() => showAlert('Não foi possível abrir o Google Maps', { title: 'Erro' }));
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

  return {
    spot,
    distance,
    region: {
      latitude: spot.latitude,
      longitude: spot.longitude,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    },
    hours: parseOpeningHours(spot.openingHours),
    wc: wheelchairLabel(spot.wheelchair || ''),
    openMaps,
    openWebsite,
    callPhone,
    openWikipedia,
  };
}
