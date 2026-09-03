export function categoryIcon(category: string): string {
  const c = (category || '').toLowerCase();
  if (c.includes('museum')) return '🏛️';
  if (c.includes('monument')) return '🗿';
  if (c.includes('castle')) return '🏰';
  if (c.includes('church')) return '⛪';
  if (c.includes('park')) return '🌳';
  if (c.includes('square')) return '🏙️';
  if (c.includes('fountain')) return '⛲';
  if (c.includes('ruins')) return '🏚️';
  if (c.includes('art')) return '🎨';
  if (c.includes('view')) return '🌄';
  return '📍';
}
