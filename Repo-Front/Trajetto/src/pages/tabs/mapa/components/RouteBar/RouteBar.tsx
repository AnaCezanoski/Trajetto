import React from 'react';
import { Text, View } from 'react-native';
import { PLACE_COLORS } from '@/constants/placeColors';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type RouteBarProps = {
  firstUpcomingIdx: number;
  hasOriginSeg: boolean;
  placeName: string | undefined;
};

export default function RouteBar({ firstUpcomingIdx, hasOriginSeg, placeName }: RouteBarProps) {
  const colors = useColors();
  const s = styles(colors);
  const currentColor = PLACE_COLORS[firstUpcomingIdx % PLACE_COLORS.length];
  const prevColor = PLACE_COLORS[(firstUpcomingIdx - 1 + PLACE_COLORS.length) % PLACE_COLORS.length];
  const displayName = placeName && placeName.length > 16 ? placeName.slice(0, 16) + '…' : placeName;

  return (
    <View style={s.routeBar}>
      <View style={[s.routeDot, { backgroundColor: currentColor }]} />
      <Text style={s.routeText} numberOfLines={1}>
        <Text style={[s.routeLabel, { color: currentColor }]}>Agora · </Text>
        {hasOriginSeg && firstUpcomingIdx === 0
          ? <Text style={[s.routeNum, { color: colors.primary }]}>Início</Text>
          : <Text style={[s.routeNum, { color: prevColor }]}>{firstUpcomingIdx}</Text>
        }
        <Text style={s.routeArrow}> → </Text>
        <Text style={[s.routeNum, { color: currentColor }]}>{firstUpcomingIdx + 1}</Text>
        {'  '}{displayName}
      </Text>
    </View>
  );
}
