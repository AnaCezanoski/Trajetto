import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Place } from '@/services';
import { useColors } from '@/src/theme';
import { categoryIcon } from '@/src/helpers/categoryIcon';
import { styles } from './styles';

type SpotCardProps = {
  spot: Place;
  onPress: () => void;
};

export default function SpotCard({ spot, onPress }: SpotCardProps) {
  const s = styles(useColors());
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      <View style={s.cardIcon}>
        <Text style={s.cardIconText}>{categoryIcon(spot.category)}</Text>
      </View>
      <View style={s.cardContent}>
        <Text style={s.cardName} numberOfLines={1}>{spot.name}</Text>
        <Text style={s.cardCategory} numberOfLines={1}>{spot.category}</Text>
        {spot.address ? <Text style={s.cardAddress} numberOfLines={1}>{spot.address}</Text> : null}
      </View>
      <Text style={s.cardArrow}>›</Text>
    </TouchableOpacity>
  );
}
