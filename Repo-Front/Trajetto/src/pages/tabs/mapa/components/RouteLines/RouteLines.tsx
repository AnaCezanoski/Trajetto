import React from 'react';
import { Text, View } from 'react-native';
import { Marker, Polyline } from 'react-native-maps';
import { PLACE_COLORS } from '@/constants/placeColors';
import { useColors } from '@/src/theme';
import { LatLng } from '../../mapaFormat';
import { interpolateAlongPath, bearing } from '../../mapaFormat';
import AnimatedDashedPolyline from '../AnimatedDashedPolyline/AnimatedDashedPolyline';
import { styles } from './styles';

type RouteLinesProps = {
  segments: LatLng[][];
  currentSegIdx: number;
  hasOriginSeg: boolean;
  firstUpcomingIdx: number;
};

export default function RouteLines({ segments, currentSegIdx, hasOriginSeg, firstUpcomingIdx }: RouteLinesProps) {
  const colors = useColors();
  const s = styles(colors);

  return (
    <>
      {segments.map((coords, i) => {
        const destColor = PLACE_COLORS[(hasOriginSeg ? i : i + 1) % PLACE_COLORS.length];
        if (i < currentSegIdx) {
          return (
            <Polyline key={`seg-${i}`} coordinates={coords} strokeWidth={1.5} strokeColor={colors.routePast} zIndex={1} />
          );
        }
        if (i === currentSegIdx) {
          return (
            <AnimatedDashedPolyline
              key={`seg-${i}`}
              coordinates={coords}
              color={PLACE_COLORS[firstUpcomingIdx % PLACE_COLORS.length]}
              zIndex={100}
            />
          );
        }
        return (
          <Polyline key={`seg-${i}`} coordinates={coords} strokeWidth={3} strokeColor={destColor} zIndex={10} />
        );
      })}

      {segments.map((coords, i) => {
        if (i <= currentSegIdx || coords.length < 2) return null;
        const mid = interpolateAlongPath(coords, 0.5);
        const endCoord = coords[coords.length - 1];
        const rot = bearing(mid, endCoord);
        const color = PLACE_COLORS[(hasOriginSeg ? i : i + 1) % PLACE_COLORS.length];
        return (
          <Marker key={`arrow-${i}`} coordinate={mid} anchor={{ x: 0.5, y: 0.5 }} rotation={rot} tracksViewChanges={false}>
            <View style={[s.arrowMarker, { borderColor: color }]}>
              <Text style={[s.arrowText, { color }]}>▶</Text>
            </View>
          </Marker>
        );
      })}
    </>
  );
}
