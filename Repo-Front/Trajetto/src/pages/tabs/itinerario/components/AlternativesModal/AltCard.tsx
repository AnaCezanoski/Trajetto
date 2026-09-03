import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Place } from '@/services';
import { useColors } from '@/src/theme';
import { categoryIcon } from '@/src/helpers/categoryIcon';
import { styles } from './styles';

export default function AltCard({ alt, onPress }: { alt: Place; onPress: () => void }) {
  const s = styles(useColors());
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      <View style={s.iconBox}>
        <Text style={s.iconText}>{categoryIcon(alt.category)}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{alt.name}</Text>
        <Text style={s.cat} numberOfLines={1}>{alt.category}</Text>
        {alt.address ? (
          <Text style={s.addr} numberOfLines={1}>{alt.address}</Text>
        ) : null}
      </View>
      {alt.fee === 'no' && (
        <View style={s.freeBadge}><Text style={s.freeBadgeText}>🆓</Text></View>
      )}
      {alt.fee === 'yes' && (
        <View style={s.paidBadge}><Text style={s.paidBadgeText}>💰</Text></View>
      )}
    </TouchableOpacity>
  );
}
