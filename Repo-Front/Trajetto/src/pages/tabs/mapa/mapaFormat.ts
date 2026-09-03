import { PlacesFilter } from '@/services';

export type LatLng = { latitude: number; longitude: number };
export type Region = LatLng & { latitudeDelta: number; longitudeDelta: number };

export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatWalkTime(meters: number): string {
  const minutes = Math.round(meters / 80);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
}

export function formatCarTime(meters: number): string {
  const minutes = Math.round(meters / 500);
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
}

export function countActiveFilters(f: PlacesFilter): number {
  let n = 0;
  if (f.category) n++;
  if (f.fee) n++;
  if (f.hasHours) n++;
  if (f.profile) n++;
  if (f.maxDistance) n++;
  return n;
}

export function interpolateAlongPath(coords: LatLng[], t: number): LatLng {
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

export function bearing(from: LatLng, to: LatLng): number {
  const dLon = (to.longitude - from.longitude) * Math.PI / 180;
  const lat1 = from.latitude * Math.PI / 180;
  const lat2 = to.latitude * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
