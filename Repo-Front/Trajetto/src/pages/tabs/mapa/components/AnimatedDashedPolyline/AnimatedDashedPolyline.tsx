import React, { useEffect, useState } from 'react';
import { Polyline } from 'react-native-maps';
import { LatLng } from '../../mapaFormat';

type AnimatedDashedPolylineProps = {
  coordinates: LatLng[];
  color: string;
  zIndex: number;
};

export default function AnimatedDashedPolyline({ coordinates, color, zIndex }: AnimatedDashedPolylineProps) {
  const [dashPhase, setDashPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setDashPhase((p) => p - 0.5), 20);
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
