import { useEffect, useState } from 'react';
import { DESTINATIONS } from '../data/destinations';

const CAROUSEL_INTERVAL_MS = 15000;

export function useDestinationCarousel() {
  const [destIndex, setDestIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDestIndex((prev) => (prev + 1) % DESTINATIONS.length);
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return destIndex;
}
