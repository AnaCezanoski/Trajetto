import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { PLACE_COLORS } from '@/constants/placeColors';
import { isPlacePast } from '@/app/utils/isPlacePast';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type PlaceMarkersProps = {
  points: any[];
  startDate: string;
  firstUpcomingIdx: number;
  pulseStyle: any;
  onPinPress: (index: number) => void;
};

export default function PlaceMarkers({ points, startDate, firstUpcomingIdx, pulseStyle, onPinPress }: PlaceMarkersProps) {
  const colors = useColors();
  const s = styles(colors);

  return (
    <>
      {points.map((point, index) => {
        const isPast = isPlacePast(startDate, point.estimatedVisitTime);
        const isNext = index === firstUpcomingIdx;
        const color = isPast ? colors.timelineDotPast : PLACE_COLORS[index % PLACE_COLORS.length];
        return (
          <Marker key={`pin-${index}`} coordinate={{ latitude: point.latitude, longitude: point.longitude }} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={isNext}>
            <View style={s.markerWrapper}>
              {isNext && (
                <Animated.View style={[s.pulse, { borderColor: color }, pulseStyle]} />
              )}
              <TouchableOpacity
                style={[s.label, isPast ? s.labelPast : { borderColor: color, backgroundColor: colors.white }]}
                onPress={() => onPinPress(index)}
                activeOpacity={0.75}
              >
                <Text style={[s.labelText, { color }]}>{index + 1}. {point.name.length > 14 ? point.name.slice(0, 14) + '…' : point.name}</Text>
                <Text style={[s.labelSub, { color }]}>{isPast ? 'visitado ✓' : 'ver no itinerário ↗'}</Text>
              </TouchableOpacity>
              <View style={[s.pinContainer, isPast && s.pinContainerPast]}>
                <MaterialIcons name="location-on" size={42} color={color} />
                <View style={[s.numberBadge, { backgroundColor: color }]}>
                  <Text style={s.numberText}>{index + 1}</Text>
                </View>
              </View>
            </View>
          </Marker>
        );
      })}
    </>
  );
}
