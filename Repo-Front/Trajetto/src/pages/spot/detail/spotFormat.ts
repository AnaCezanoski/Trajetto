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

export function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

export function formatWalk(m: number) {
  const min = Math.round(m / 80);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)}h ${min % 60}min`;
}

export function formatCar(m: number) {
  const min = Math.round(m / 500);
  if (min < 1) return '< 1 min';
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)}h ${min % 60}min`;
}

export function wheelchairLabel(value: string) {
  if (!value) return null;
  const map: Record<string, string> = {
    yes: '♿ Totalmente acessível',
    limited: '♿ Parcialmente acessível',
    no: '🚫 Não acessível',
  };
  return map[value] || value;
}

export function parseOpeningHours(raw: string): { period: string; hours: string }[] {
  if (!raw) return [];
  return raw
    .split(';')
    .map((s) => {
      const trimmed = s.trim();
      const colonIdx = trimmed.lastIndexOf(':');
      if (colonIdx === -1) return { period: trimmed, hours: '' };
      const period = trimmed.slice(0, colonIdx - 6).trim();
      const hours = trimmed.slice(colonIdx - 5).trim();
      return { period, hours };
    })
    .filter((s) => s.period || s.hours);
}
