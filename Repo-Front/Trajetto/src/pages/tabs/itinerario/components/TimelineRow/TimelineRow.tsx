import React from 'react';
import { View } from 'react-native';
import { LayoutChangeEvent } from 'react-native';
import { Places } from '@/hooks/itineraryStore';
import { TicketCard } from '@/components/TicketCard';
import { useColors } from '@/src/theme';
import SwipeableCard from '../SwipeableCard/SwipeableCard';
import { styles } from './styles';

type TimelineRowProps = {
  place: Places;
  idx: number;
  color: string;
  isPast: boolean;
  isLast: boolean;
  isHighlighted: boolean;
  onLayout: (e: LayoutChangeEvent) => void;
  onSwipeLeft: () => void;
  onPress: () => void;
  onInfoPress: () => void;
};

export default function TimelineRow({
  place, idx, color, isPast, isLast, isHighlighted, onLayout, onSwipeLeft, onPress, onInfoPress,
}: TimelineRowProps) {
  const s = styles(useColors());

  return (
    <View style={s.timelineRow} onLayout={onLayout}>
      <View style={s.rail}>
        <View style={[s.dot, isPast ? s.dotPast : { backgroundColor: color }]} />
        {!isLast && <View style={s.line} />}
      </View>

      <SwipeableCard onSwipeLeft={onSwipeLeft} disabled={isPast}>
        <TicketCard
          place={place}
          idx={idx}
          color={color}
          isPast={isPast}
          isHighlighted={isHighlighted}
          isLast={isLast}
          onPress={onPress}
          onInfoPress={onInfoPress}
        />
      </SwipeableCard>
    </View>
  );
}
